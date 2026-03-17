import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  // Vercel cron calls this , secure with a secret
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get all Pro users with digest enabled
    const { data: users } = await supabase
      .from('profiles')
      .select('*')
      .eq('tier', 'pro')
      .eq('digest_enabled', true);

    if (!users?.length) return res.status(200).json({ sent: 0 });

    let sent = 0;

    for (const user of users) {
      try {
        // Generate digest with Claude
        const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1200,
            messages: [{
              role: 'user',
              content: `Write a morning news digest for someone who follows these beats: ${(user.beats || []).join(', ')}.
Respond ONLY with valid JSON:
{"digest":"2-3 sentence overall summary","sections":[{"beat":"Politics","color":"#c1440e","stories":[{"headline":"...","summary":"...","source":"..."}]}]}`
            }]
          })
        });

        const claudeData = await claudeRes.json();
        const raw = claudeData.content.map(c => c.text || '').join('').replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(raw);

        const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

        let sectionsHTML = '';
        parsed.sections.forEach(sec => {
          sectionsHTML += `<p style="margin:14px 0 6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${sec.color};font-family:monospace;">${sec.beat}</p>`;
          sec.stories.forEach(s => {
            sectionsHTML += `<div style="padding:8px 0;border-bottom:1px solid #f0ede8;">
              <p style="margin:0 0 3px;font-family:Georgia,serif;font-size:15px;line-height:1.3;color:#1a1a1a;">${s.headline}</p>
              <p style="margin:0 0 3px;font-size:12px;line-height:1.5;color:#666;">${s.summary}</p>
              <p style="margin:0;font-size:10px;color:#999;">${s.source}</p>
            </div>`;
          });
        });

        const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f7f4ee;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4ee;padding:24px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border:1px solid #d4cfc4;">
  <tr><td style="background:#0f0e0c;padding:24px 32px;text-align:center;">
    <p style="margin:0;font-family:Georgia,serif;font-size:24px;font-style:italic;font-weight:900;color:#fff;">Headlines<span style="font-weight:400;color:#c1440e;">Report</span></p>
    <p style="margin:4px 0 0;font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:1px;font-family:monospace;">${date} · Morning Briefing</p>
  </td></tr>
  <tr><td style="background:#f9f7f2;padding:14px 32px;border-bottom:1px solid #e8e5df;">
    <p style="margin:0 0 5px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#999;font-family:monospace;">Curated Digest</p>
    <p style="margin:0;font-size:13px;line-height:1.7;color:#444;">${parsed.digest}</p>
  </td></tr>
  <tr><td style="padding:4px 32px 20px;">${sectionsHTML}</td></tr>
  <tr><td style="background:#f7f4ee;padding:14px 32px;border-top:1px solid #d4cfc4;text-align:center;">
    <p style="margin:0;font-size:10px;color:#aaa;font-family:monospace;">Headlines Report · <a href="https://headlinesreport.com/unsubscribe" style="color:#aaa;">Unsubscribe</a></p>
  </td></tr>
</table></td></tr></table>
</body></html>`;

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` },
          body: JSON.stringify({
            from: process.env.FROM_EMAIL || 'morning@headlinesreport.com',
            to: [user.email],
            subject: `Your morning briefing , ${date}`,
            html
          })
        });

        sent++;
      } catch (userErr) {
        console.error(`Failed for ${user.email}:`, userErr.message);
      }
    }

    return res.status(200).json({ success: true, sent });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
