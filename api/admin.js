import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const ADMIN_SECRET = process.env.ADMIN_SECRET;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Auth check
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token !== ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });

  const { action } = req.query;

  try {
    // ── STATS ─────────────────────────────────────────────
    if (action === 'stats') {
      const { data: users } = await supabase.from('profiles').select('*');
      const total = users?.length || 0;
      const pro = users?.filter(u => u.tier === 'pro').length || 0;
      const digestEnabled = users?.filter(u => u.digest_enabled).length || 0;
      const mrr = pro * 7;
      return res.status(200).json({ success: true, stats: { total, pro, free: total - pro, digestEnabled, mrr } });
    }

    // ── USER LIST ──────────────────────────────────────────
    if (action === 'users') {
      const { data: users } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      return res.status(200).json({ success: true, users });
    }

    // ── UPDATE USER TIER ───────────────────────────────────
    if (action === 'set_tier') {
      const { userId, tier } = req.body;
      await supabase.from('profiles').update({ tier }).eq('id', userId);
      return res.status(200).json({ success: true });
    }

    // ── SEND BROADCAST ─────────────────────────────────────
    if (action === 'broadcast') {
      const { subject, html, segment } = req.body;
      let query = supabase.from('profiles').select('email');
      if (segment === 'pro') query = query.eq('tier', 'pro');
      const { data: users } = await query;
      if (!users?.length) return res.status(200).json({ success: true, sent: 0 });

      let sent = 0;
      for (const user of users) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` },
            body: JSON.stringify({ from: process.env.FROM_EMAIL || 'morning@headlinesreport.com', to: [user.email], subject, html })
          });
          sent++;
        } catch(e) { console.error(e); }
      }
      return res.status(200).json({ success: true, sent });
    }

    // ── TRIGGER TEST DIGEST ────────────────────────────────
    if (action === 'test_digest') {
      const { email, beats } = req.body;
      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 1000,
          messages: [{ role: 'user', content: `Write a morning news digest for beats: ${beats.join(', ')}. No em dashes. JSON only: {"digest":"...","sections":[{"beat":"...","color":"#c1440e","stories":[{"headline":"...","summary":"...","source":"..."}]}]}` }]
        })
      });
      const claudeData = await claudeRes.json();
      const raw = claudeData.content.map(c => c.text||'').join('').replace(/```json|```/g,'').trim();
      const parsed = JSON.parse(raw);
      const date = new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });
      let sectionsHTML = '';
      parsed.sections.forEach(sec => {
        sectionsHTML += `<p style="margin:12px 0 4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${sec.color};font-family:monospace;">${sec.beat}</p>`;
        sec.stories.forEach(s => { sectionsHTML += `<div style="padding:8px 0;border-bottom:1px solid #f0ede8;"><p style="margin:0 0 3px;font-family:Georgia,serif;font-size:15px;color:#1a1a1a;">${s.headline}</p><p style="margin:0;font-size:12px;color:#666;">${s.summary}</p></div>`; });
      });
      const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;"><div style="background:#0f0e0c;padding:20px;text-align:center;"><p style="margin:0;font-family:Georgia,serif;font-size:22px;font-style:italic;font-weight:900;color:#fff;">Headlines<span style="font-weight:400;color:#c1440e;">Report</span></p><p style="margin:4px 0 0;font-size:10px;color:rgba(255,255,255,0.4);font-family:monospace;">${date}</p></div><div style="background:#f9f7f2;padding:14px 20px;"><p style="margin:0 0 4px;font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:#999;font-family:monospace;">Curated Digest</p><p style="margin:0;font-size:13px;line-height:1.7;color:#444;">${parsed.digest}</p></div><div style="padding:4px 20px 16px;">${sectionsHTML}</div></div>`;
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` },
        body: JSON.stringify({ from: process.env.FROM_EMAIL || 'morning@headlinesreport.com', to: [email], subject: `Test digest, ${date}`, html })
      });
      return res.status(200).json({ success: true });
    }

    // ── WAITLIST (Resend Audience) ────────────────────────
    if (action === 'waitlist') {
      const audienceId = process.env.RESEND_AUDIENCE_ID;
      const resendRes = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
        headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` }
      });
      const data = await resendRes.json();
      const contacts = (data.data || []).map(c => ({
        email: c.email,
        unsubscribed: c.unsubscribed,
        created_at: c.created_at
      }));
      contacts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return res.status(200).json({ success: true, contacts, total: contacts.length });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
}
