const CHANNEL_FEEDS = {
  mainstream: [
    'https://feeds.apnews.com/rss/apf-topnews',
    'https://feeds.reuters.com/reuters/topNews',
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://feeds.npr.org/1001/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
    'https://feeds.washingtonpost.com/rss/national',
    'https://www.theguardian.com/world/rss',
    'https://rss.politico.com/politics-news.xml',
  ],
  international: [
    'https://www.aljazeera.com/xml/rss/all.xml',
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'https://feeds.reuters.com/Reuters/worldNews',
    'https://rss.dw.com/rdf/rss-en-all',
    'https://foreignpolicy.com/feed/',
    'https://www.theguardian.com/world/rss',
    'https://feeds.skynews.com/feeds/rss/world.xml',
  ],
  independent: [
    'https://voxunderground.substack.com/feed',
    'https://www.platformer.news/feed',
    'https://sherwood.news/feed',
    'https://theintercept.com/feed/?rss',
    'https://defector.com/feed',
    'https://www.propublica.org/feeds/propublica/main',
    'https://themarkup.org/feeds/rss.xml',
    'https://www.motherjones.com/feed/',
  ],
  business: [
    'https://feeds.reuters.com/reuters/businessNews',
    'https://feeds.bloomberg.com/markets/news.rss',
    'https://www.ft.com/?format=rss',
    'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml',
    'https://sherwood.news/feed',
    'https://feeds.cnbc.com/rss/site/102/3096.rss',
    'https://fortune.com/feed/',
    'https://www.economist.com/finance-and-economics/rss.xml',
  ],
  tech: [
    'https://www.technologyreview.com/feed/',
    'https://www.wired.com/feed/rss',
    'https://feeds.arstechnica.com/arstechnica/index',
    'https://www.theverge.com/rss/index.xml',
    'https://techcrunch.com/feed/',
    'https://www.engadget.com/rss.xml',
    'https://feeds.feedburner.com/TheHackersNews',
    'https://www.scientificamerican.com/platform/morgue/2020/01/01_rss_id/rss.xml',
  ],
  politics: [
    'https://rss.politico.com/politics-news.xml',
    'https://thehill.com/rss/syndicator/19109',
    'https://feeds.axios.com/axios/us-news',
    'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml',
    'https://feeds.washingtonpost.com/rss/politics',
    'https://www.theguardian.com/politics/rss',
    'https://feeds.reuters.com/Reuters/PoliticsNews',
    'https://www.rollcall.com/feed/',
  ],
  opinion: [
    'https://rss.nytimes.com/services/xml/rss/nyt/Opinion.xml',
    'https://feeds.washingtonpost.com/rss/opinions',
    'https://www.theguardian.com/commentisfree/rss',
    'https://feeds.reuters.com/reuters/opinion',
    'https://www.economist.com/leaders/rss.xml',
    'https://foreignpolicy.com/category/analysis/feed/',
    'https://theintercept.com/feed/?rss',
  ],
  alerts: [
    'https://feeds.apnews.com/rss/apf-topnews',
    'https://feeds.reuters.com/reuters/topNews',
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://feeds.npr.org/1001/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  ],
};

// Beat-based feed mapping for custom beats
const BEAT_FEEDS = {
  politics: 'https://rss.politico.com/politics-news.xml',
  economy: 'https://feeds.reuters.com/reuters/businessNews',
  technology: 'https://feeds.arstechnica.com/arstechnica/index',
  world: 'https://feeds.bbci.co.uk/news/world/rss.xml',
  education: 'https://feeds.npr.org/1013/rss.xml',
  health: 'https://feeds.npr.org/1128/rss.xml',
  science: 'https://feeds.reuters.com/reuters/scienceNews',
  culture: 'https://www.theguardian.com/culture/rss',
  sports: 'https://feeds.bbci.co.uk/sport/rss.xml',
  climate: 'https://www.theguardian.com/environment/rss',
  business: 'https://feeds.reuters.com/reuters/businessNews',
  markets: 'https://feeds.bloomberg.com/markets/news.rss',
  finance: 'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml',
  congress: 'https://rss.politico.com/congress.xml',
  elections: 'https://rss.politico.com/politics-news.xml',
  policy: 'https://thehill.com/rss/syndicator/19109',
  breaking: 'https://feeds.apnews.com/rss/apf-topnews',
  diplomacy: 'https://foreignpolicy.com/feed/',
  media: 'https://www.theverge.com/rss/index.xml',
  ai: 'https://www.technologyreview.com/feed/',
  opinion: 'https://rss.nytimes.com/services/xml/rss/nyt/Opinion.xml',
  ideas: 'https://www.economist.com/leaders/rss.xml',
};

async function fetchRSS(url) {
  try {
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(proxy, { signal: controller.signal });
    clearTimeout(timeout);
    const data = await res.json();
    return data.contents || '';
  } catch(e) {
    return '';
  }
}

function parseRSS(xml, sourceName) {
  try {
    const items = [];
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const item = match[1];
      const title = (item.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/) || [])[1]?.trim();
      const link = (item.match(/<link[^>]*>([^<]+)<\/link>/) || item.match(/<link[^>]*href="([^"]+)"/) || [])[1]?.trim();
      const desc = (item.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/) || [])[1]?.trim();
      const pubDate = (item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/) || [])[1]?.trim();

      if (!title || title.length < 5) continue;

      // Clean HTML from description
      const cleanDesc = desc ? desc.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim().slice(0, 200) : '';

      // Format time ago
      let timeAgo = '';
      if (pubDate) {
        const diff = Date.now() - new Date(pubDate).getTime();
        const h = Math.floor(diff / 3600000);
        const d = Math.floor(diff / 86400000);
        timeAgo = d > 0 ? `${d}d ago` : h > 0 ? `${h}h ago` : 'Just now';
      }

      // Clean em dashes from content
      const cleanTitle = title.replace(/—/g, ',').replace(/–/g, ',');
      const cleanSummary = (cleanDesc || 'Read the full story.').replace(/—/g, ',').replace(/–/g, ',');

      items.push({
        headline: cleanTitle,
        summary: cleanSummary + (cleanSummary.length >= 200 ? '...' : ''),
        source: sourceName,
        time: timeAgo,
        url: link || '',
        type: 'news'
      });
    }
    return items;
  } catch(e) {
    return [];
  }
}

function getSourceName(url) {
  const map = {
    'apnews.com': 'AP News',
    'reuters.com': 'Reuters',
    'bbci.co.uk': 'BBC News',
    'bbc.co.uk': 'BBC News',
    'npr.org': 'NPR',
    'nytimes.com': 'New York Times',
    'washingtonpost.com': 'Washington Post',
    'theguardian.com': 'The Guardian',
    'politico.com': 'Politico',
    'aljazeera.com': 'Al Jazeera',
    'dw.com': 'DW News',
    'foreignpolicy.com': 'Foreign Policy',
    'skynews.com': 'Sky News',
    'voxunderground.substack.com': 'The Underground',
    'platformer.news': 'Platformer',
    'sherwood.news': 'Sherwood News',
    'theintercept.com': 'The Intercept',
    'defector.com': 'Defector',
    'propublica.org': 'ProPublica',
    'themarkup.org': 'The Markup',
    'motherjones.com': 'Mother Jones',
    'bloomberg.com': 'Bloomberg',
    'ft.com': 'Financial Times',
    'wsj.com': 'Wall Street Journal',
    'cnbc.com': 'CNBC',
    'fortune.com': 'Fortune',
    'economist.com': 'The Economist',
    'technologyreview.com': 'MIT Tech Review',
    'wired.com': 'Wired',
    'arstechnica.com': 'Ars Technica',
    'theverge.com': 'The Verge',
    'techcrunch.com': 'TechCrunch',
    'engadget.com': 'Engadget',
    'thehill.com': 'The Hill',
    'axios.com': 'Axios',
    'rollcall.com': 'Roll Call',
    'scientificamerican.com': 'Scientific American',
  };
  try {
    const host = new URL(url).hostname.replace('www.', '').replace('feeds.', '');
    for (const [key, name] of Object.entries(map)) {
      if (host.includes(key)) return name;
    }
    return host.split('.')[0].charAt(0).toUpperCase() + host.split('.')[0].slice(1);
  } catch(e) { return 'News'; }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { channel, beats } = req.query;

  try {
    let feedUrls = [];

    if (channel && CHANNEL_FEEDS[channel]) {
      feedUrls = CHANNEL_FEEDS[channel];
    } else if (beats) {
      const beatList = beats.split(',').map(b => b.trim().toLowerCase());
      const seen = new Set();
      beatList.forEach(b => {
        const url = BEAT_FEEDS[b];
        if (url && !seen.has(url)) { seen.add(url); feedUrls.push(url); }
      });
      // Always include AP as baseline
      if (!feedUrls.includes('https://feeds.apnews.com/rss/apf-topnews')) {
        feedUrls.unshift('https://feeds.apnews.com/rss/apf-topnews');
      }
    } else {
      feedUrls = CHANNEL_FEEDS.mainstream;
    }

    // Fetch up to 6 feeds in parallel (balance speed vs coverage)
    const selectedFeeds = feedUrls.slice(0, 6);
    const results = await Promise.allSettled(
      selectedFeeds.map(async url => {
        const xml = await fetchRSS(url);
        const name = getSourceName(url);
        return parseRSS(xml, name);
      })
    );

    // Merge, deduplicate by headline similarity, sort by recency
    const seen = new Set();
    let articles = [];
    results.forEach(r => {
      if (r.status === 'fulfilled') {
        r.value.forEach(a => {
          const key = a.headline.slice(0, 40).toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            articles.push(a);
          }
        });
      }
    });

    // Sort: items with time first, then others
    articles.sort((a, b) => {
      if (a.time && !b.time) return -1;
      if (!a.time && b.time) return 1;
      return 0;
    });

    // Return 10-15 stories
    articles = articles.slice(0, 15);

    return res.status(200).json({ success: true, articles, count: articles.length, sources: selectedFeeds.length });

  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
}
