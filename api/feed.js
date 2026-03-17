const CHANNEL_FEEDS = {
  mainstream: [
    { url: 'https://feeds.apnews.com/rss/apf-topnews', name: 'AP News' },
    { url: 'https://feeds.bbci.co.uk/news/rss.xml', name: 'BBC News' },
    { url: 'https://feeds.npr.org/1001/rss.xml', name: 'NPR' },
    { url: 'https://www.theguardian.com/world/rss', name: 'The Guardian' },
    { url: 'https://rss.politico.com/politics-news.xml', name: 'Politico' },
  ],
  international: [
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', name: 'Al Jazeera' },
    { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', name: 'BBC World' },
    { url: 'https://rss.dw.com/rdf/rss-en-all', name: 'DW News' },
    { url: 'https://foreignpolicy.com/feed/', name: 'Foreign Policy' },
    { url: 'https://www.theguardian.com/world/rss', name: 'The Guardian' },
  ],
  independent: [
    { url: 'https://voxunderground.substack.com/feed', name: 'The Underground' },
    { url: 'https://www.platformer.news/feed', name: 'Platformer' },
    { url: 'https://theintercept.com/feed/?rss', name: 'The Intercept' },
    { url: 'https://www.propublica.org/feeds/propublica/main', name: 'ProPublica' },
    { url: 'https://www.motherjones.com/feed/', name: 'Mother Jones' },
  ],
  business: [
    { url: 'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml', name: 'Wall Street Journal' },
    { url: 'https://www.ft.com/?format=rss', name: 'Financial Times' },
    { url: 'https://fortune.com/feed/', name: 'Fortune' },
    { url: 'https://www.economist.com/finance-and-economics/rss.xml', name: 'The Economist' },
    { url: 'https://feeds.cnbc.com/rss/site/102/3096.rss', name: 'CNBC' },
  ],
  tech: [
    { url: 'https://www.technologyreview.com/feed/', name: 'MIT Tech Review' },
    { url: 'https://www.wired.com/feed/rss', name: 'Wired' },
    { url: 'https://feeds.arstechnica.com/arstechnica/index', name: 'Ars Technica' },
    { url: 'https://www.theverge.com/rss/index.xml', name: 'The Verge' },
    { url: 'https://techcrunch.com/feed/', name: 'TechCrunch' },
  ],
  politics: [
    { url: 'https://rss.politico.com/politics-news.xml', name: 'Politico' },
    { url: 'https://thehill.com/rss/syndicator/19109', name: 'The Hill' },
    { url: 'https://feeds.npr.org/1001/rss.xml', name: 'NPR' },
    { url: 'https://www.theguardian.com/us-news/rss', name: 'The Guardian' },
    { url: 'https://www.rollcall.com/feed/', name: 'Roll Call' },
  ],
  opinion: [
    { url: 'https://www.theguardian.com/commentisfree/rss', name: 'The Guardian' },
    { url: 'https://www.economist.com/leaders/rss.xml', name: 'The Economist' },
    { url: 'https://foreignpolicy.com/category/analysis/feed/', name: 'Foreign Policy' },
    { url: 'https://theintercept.com/feed/?rss', name: 'The Intercept' },
  ],
  alerts: [
    { url: 'https://feeds.apnews.com/rss/apf-topnews', name: 'AP News' },
    { url: 'https://feeds.bbci.co.uk/news/rss.xml', name: 'BBC News' },
    { url: 'https://feeds.npr.org/1001/rss.xml', name: 'NPR' },
  ],
};

const BEAT_FEEDS = {
  politics: { url: 'https://rss.politico.com/politics-news.xml', name: 'Politico' },
  economy: { url: 'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml', name: 'Wall Street Journal' },
  technology: { url: 'https://feeds.arstechnica.com/arstechnica/index', name: 'Ars Technica' },
  world: { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', name: 'BBC World' },
  education: { url: 'https://feeds.npr.org/1013/rss.xml', name: 'NPR Education' },
  health: { url: 'https://feeds.npr.org/1128/rss.xml', name: 'NPR Health' },
  science: { url: 'https://www.theguardian.com/science/rss', name: 'The Guardian' },
  culture: { url: 'https://www.theguardian.com/culture/rss', name: 'The Guardian' },
  climate: { url: 'https://www.theguardian.com/environment/rss', name: 'The Guardian' },
  business: { url: 'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml', name: 'Wall Street Journal' },
  breaking: { url: 'https://feeds.apnews.com/rss/apf-topnews', name: 'AP News' },
  diplomacy: { url: 'https://foreignpolicy.com/feed/', name: 'Foreign Policy' },
  ai: { url: 'https://www.technologyreview.com/feed/', name: 'MIT Tech Review' },
  opinion: { url: 'https://www.theguardian.com/commentisfree/rss', name: 'The Guardian' },
  congress: { url: 'https://rss.politico.com/congress.xml', name: 'Politico' },
  elections: { url: 'https://rss.politico.com/politics-news.xml', name: 'Politico' },
  media: { url: 'https://www.theverge.com/rss/index.xml', name: 'The Verge' },
};

async function fetchRSS(feedUrl, sourceName) {
  try {
    const res = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HeadlinesReport/1.0; +https://headlinesreport.com)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      redirect: 'follow',
    });

    if (!res.ok) return [];
    const xml = await res.text();
    return parseRSS(xml, sourceName);
  } catch(e) {
    return [];
  }
}

function parseRSS(xml, sourceName) {
  try {
    const items = [];
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(xml)) !== null && items.length < 5) {
      const item = match[1];

      const title = extractTag(item, 'title');
      const link = extractLink(item);
      const desc = extractTag(item, 'description');
      const pubDate = extractTag(item, 'pubDate');

      if (!title || title.length < 10) continue;

      const cleanDesc = desc
        ? desc.replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim().slice(0, 220)
        : '';

      const timeAgo = formatTime(pubDate);
      const cleanTitle = title.replace(/[—–]/g, ',').replace(/\s+/g, ' ').trim();
      const cleanSummary = (cleanDesc || 'Read the full story.').replace(/[—–]/g, ',');

      items.push({
        headline: cleanTitle,
        summary: cleanSummary + (cleanDesc.length >= 220 ? '...' : ''),
        source: sourceName,
        time: timeAgo,
        url: link || '',
        type: 'news',
      });
    }
    return items;
  } catch(e) {
    return [];
  }
}

function extractTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i'));
  return m ? m[1].trim() : '';
}

function extractLink(item) {
  const m = item.match(/<link[^>]*>([^<]+)<\/link>/) ||
            item.match(/<link[^>]+href="([^"]+)"/) ||
            item.match(/<guid[^>]*>([^<]+)<\/guid>/);
  return m ? m[1].trim() : '';
}

function formatTime(pubDate) {
  if (!pubDate) return '';
  try {
    const diff = Date.now() - new Date(pubDate).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    return 'Just now';
  } catch(e) { return ''; }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { channel, beats } = req.query;

  try {
    let feeds = [];

    if (channel && CHANNEL_FEEDS[channel]) {
      feeds = CHANNEL_FEEDS[channel].slice(0, 5);
    } else if (beats) {
      const beatList = beats.split(',').map(b => b.trim().toLowerCase());
      const seen = new Set();
      // Always include AP as baseline
      feeds.push({ url: 'https://feeds.apnews.com/rss/apf-topnews', name: 'AP News' });
      seen.add('feeds.apnews.com');
      beatList.forEach(b => {
        const f = BEAT_FEEDS[b];
        if (f) {
          const host = new URL(f.url).hostname;
          if (!seen.has(host)) { seen.add(host); feeds.push(f); }
        }
      });
      feeds = feeds.slice(0, 5);
    } else {
      feeds = CHANNEL_FEEDS.mainstream.slice(0, 5);
    }

    // Fetch all feeds in parallel with 8s timeout
    const results = await Promise.allSettled(
      feeds.map(f => fetchRSS(f.url, f.name))
    );

    // Merge and deduplicate
    const seen = new Set();
    let articles = [];
    results.forEach(r => {
      if (r.status === 'fulfilled') {
        r.value.forEach(a => {
          const key = a.headline.slice(0, 50).toLowerCase().replace(/[^a-z0-9]/g, '');
          if (!seen.has(key) && a.headline.length > 10) {
            seen.add(key);
            articles.push(a);
          }
        });
      }
    });

    articles = articles.slice(0, 15);

    return res.status(200).json({
      success: true,
      articles,
      count: articles.length,
      sources: feeds.map(f => f.name),
    });

  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
}
