import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Generate a short unique code from a user ID
function makeCode(userId) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash);
  for (let i = 0; i < 6; i++) {
    code += chars[(seed * (i + 7) * 2654435761 >>> 0) % chars.length];
  }
  return code;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action } = req.query;

  try {
    // ── GENERATE: get or create a referral code for the logged-in user
    if (action === 'generate') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Unauthorized' });

      const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
      if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

      // Check if code already exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code, referral_credits, referred_count')
        .eq('id', user.id)
        .single();

      if (profile?.referral_code) {
        return res.status(200).json({
          success: true,
          code: profile.referral_code,
          credits: profile.referral_credits || 0,
          referred_count: profile.referred_count || 0,
          link: `https://headlinesreport.com/app.html?ref=${profile.referral_code}`
        });
      }

      // Generate and save a new code
      let code = makeCode(user.id);
      // Check for collision, regenerate if needed
      const { data: existing } = await supabase
        .from('profiles').select('id').eq('referral_code', code).single();
      if (existing) code = makeCode(user.id + Date.now());

      await supabase.from('profiles').update({ referral_code: code }).eq('id', user.id);

      return res.status(200).json({
        success: true,
        code,
        credits: 0,
        referred_count: 0,
        link: `https://headlinesreport.com/app.html?ref=${code}`
      });
    }

    // ── APPLY: called at signup with a ref code, credits both parties
    if (action === 'apply') {
      const { newUserId, refCode } = req.body;
      if (!newUserId || !refCode) return res.status(400).json({ error: 'Missing fields' });

      // Find the referrer
      const { data: referrer } = await supabase
        .from('profiles')
        .select('id, referral_credits, referred_count')
        .eq('referral_code', refCode)
        .single();

      if (!referrer) return res.status(404).json({ error: 'Invalid referral code' });
      if (referrer.id === newUserId) return res.status(400).json({ error: 'Cannot refer yourself' });

      // Link the new user to their referrer and give them 1 credit
      await supabase.from('profiles').update({
        referred_by: refCode,
        referral_credits: 1
      }).eq('id', newUserId);

      // Give the referrer a credit and increment their count
      await supabase.from('profiles').update({
        referral_credits: (referrer.referral_credits || 0) + 1,
        referred_count: (referrer.referred_count || 0) + 1
      }).eq('id', referrer.id);

      return res.status(200).json({ success: true, referrerId: referrer.id });
    }

    // ── STATS: get referral stats for the logged-in user
    if (action === 'stats') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Unauthorized' });

      const { data: { user } } = await supabase.auth.getUser(token);
      if (!user) return res.status(401).json({ error: 'Invalid token' });

      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code, referral_credits, referred_count')
        .eq('id', user.id)
        .single();

      return res.status(200).json({
        success: true,
        code: profile?.referral_code || null,
        credits: profile?.referral_credits || 0,
        referred_count: profile?.referred_count || 0
      });
    }

    return res.status(400).json({ error: 'Unknown action' });

  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
}
