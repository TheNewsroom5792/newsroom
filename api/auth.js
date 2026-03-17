import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action } = req.query;

  try {
    // ── SIGN UP ──────────────────────────────────────────
    if (action === 'signup') {
      const { email, password } = req.body;
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });
      if (error) return res.status(400).json({ error: error.message });

      // Create profile row
      await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        tier: 'free',
        beats: ['Politics', 'Economy', 'Technology'],
        substacks: [],
        digest_time: '07:00',
        digest_enabled: false,
        created_at: new Date().toISOString()
      });

      // Add to Resend waitlist audience
      await fetch(`https://api.resend.com/audiences/${process.env.RESEND_AUDIENCE_ID}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` },
        body: JSON.stringify({ email, unsubscribed: false })
      });

      return res.status(200).json({ success: true, user: data.user });
    }

    // ── SIGN IN ──────────────────────────────────────────
    if (action === 'signin') {
      const { email, password } = req.body;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return res.status(401).json({ error: error.message });
      return res.status(200).json({ success: true, session: data.session, user: data.user });
    }

    // ── GET PROFILE ──────────────────────────────────────
    if (action === 'profile') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'No token' });
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) return res.status(401).json({ error: 'Invalid token' });
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      return res.status(200).json({ success: true, profile });
    }

    // ── SAVE PREFERENCES ─────────────────────────────────
    if (action === 'save') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'No token' });
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) return res.status(401).json({ error: 'Invalid token' });
      const { beats, substacks, digest_time, digest_enabled } = req.body;
      await supabase.from('profiles').update({ beats, substacks, digest_time, digest_enabled }).eq('id', user.id);
      return res.status(200).json({ success: true });
    }

    // ── SAVE ARTICLE ─────────────────────────────────────
    if (action === 'save_article') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'No token' });
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) return res.status(401).json({ error: 'Invalid token' });
      const { headline, summary, source, url, beat } = req.body;
      await supabase.from('saved_articles').insert({
        user_id: user.id, headline, summary, source, url, beat,
        saved_at: new Date().toISOString()
      });
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Unknown action' });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
