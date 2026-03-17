import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const CHANNELS = [
  {
    id: 'mainstream', name: 'Mainstream', icon: '📺',
    desc: 'The major outlets. AP, Reuters, NYT, WaPo, BBC. The standard morning diet.',
    beats: ['Politics', 'Economy', 'World', 'Technology'],
    substacks: []
  },
  {
    id: 'international', name: 'International', icon: '🌍',
    desc: 'Global perspective. Al Jazeera, Foreign Policy, The Economist, Reuters World.',
    beats: ['World', 'Politics', 'Economy', 'Diplomacy'],
    substacks: []
  },
  {
    id: 'independent', name: 'Independent', icon: '🔦',
    desc: 'Outside the mainstream. The Underground, Platformer, The Intercept, Defector.',
    beats: ['Politics', 'Culture', 'Technology', 'Media'],
    substacks: [
      { url: 'https://voxunderground.substack.com/feed', name: 'The Underground', featured: true },
      { url: 'https://www.platformer.news/feed', name: 'Platformer' },
      { url: 'https://sherwood.news/feed', name: 'Sherwood News' }
    ]
  },
  {
    id: 'business', name: 'Business', icon: '📈',
    desc: 'Markets, money, and corporate power. Bloomberg, FT, WSJ, Sherwood News.',
    beats: ['Economy', 'Markets', 'Business', 'Finance'],
    substacks: []
  },
  {
    id: 'tech', name: 'Tech and Science', icon: '💡',
    desc: 'From the labs to the boardroom. MIT Tech Review, Wired, Ars Technica.',
    beats: ['Technology', 'Science', 'AI', 'Climate'],
    substacks: []
  },
  {
    id: 'politics', name: 'Politics and Policy', icon: '🏛',
    desc: 'Inside the machine. Politico, The Hill, Axios AM, Punchbowl News.',
    beats: ['Politics', 'Policy', 'Congress', 'Elections'],
    substacks: []
  },
  {
    id: 'opinion', name: 'Opinion', icon: '✍️',
    desc: 'Voices worth reading. Columnists, editorial boards, and independent thinkers.',
    beats: ['Opinion', 'Politics', 'Culture', 'Ideas'],
    substacks: []
  },
  {
    id: 'alerts', name: 'Breaking Alerts', icon: '🚨',
    desc: 'High priority only. Breaking news flagged across all major beats.',
    beats: ['Breaking', 'Politics', 'World', 'Economy'],
    substacks: []
  }
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action } = req.query;

  try {
    // ── GET ALL CHANNELS ─────────────────────────────────
    if (req.method === 'GET' || action === 'list') {
      return res.status(200).json({ success: true, channels: CHANNELS });
    }

    // ── SUBSCRIBE TO CHANNEL ─────────────────────────────
    if (action === 'subscribe') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'No token' });
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) return res.status(401).json({ error: 'Invalid token' });

      const { channelId } = req.body;
      const channel = CHANNELS.find(c => c.id === channelId);
      if (!channel) return res.status(400).json({ error: 'Channel not found' });

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const isFree = profile.tier !== 'pro';
      const FREE_BEATS = 3;
      const FREE_SUBS = 2;

      let beats = profile.beats || [];
      let substacks = profile.substacks || [];

      channel.beats.forEach(b => {
        if (!beats.map(x => x.toLowerCase()).includes(b.toLowerCase())) {
          if (!isFree || beats.length < FREE_BEATS) beats.push(b);
        }
      });

      channel.substacks.forEach(s => {
        if (!substacks.find(x => x.url === s.url)) {
          if (!isFree || substacks.length < FREE_SUBS) substacks.push(s);
        }
      });

      await supabase.from('profiles').update({ beats, substacks }).eq('id', user.id);

      return res.status(200).json({ success: true, beats, substacks });
    }

    return res.status(400).json({ error: 'Unknown action' });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
