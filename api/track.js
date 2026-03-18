import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action } = req.query;

  try {
    // -- TRACK: log a click event
    if (action === 'click') {
      const { headline, source, url, beat } = req.body;
      const token = req.headers.authorization?.replace('Bearer ', '');
      let userId = null;
      if (token) {
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id || null;
      }
      await supabase.from('article_clicks').insert({
        user_id: userId,
        headline: headline?.substring(0, 200),
        source,
        url: url?.substring(0, 500),
        beat,
        clicked_at: new Date().toISOString()
      });
      return res.status(200).json({ success: true });
    }

    // -- TRENDING: get most clicked articles in last 48h
    if (action === 'trending') {
      const since = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
      const { data } = await supabase
        .from('article_clicks')
        .select('headline, source, url, beat, count:headline.count()')
        .gte('clicked_at', since)
        .order('count', { ascending: false })
        .limit(10);
      return res.status(200).json({ success: true, trending: data || [] });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
}
