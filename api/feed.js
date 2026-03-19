// feed.js  -  Headlines Report RSS aggregator
// 100+ sources across 50+ beat categories

const CHANNEL_FEEDS = {
  mainstream: [
    { url: 'https://feeds.apnews.com/rss/apf-topnews', name: 'AP News' },
    { url: 'https://feeds.bbci.co.uk/news/rss.xml', name: 'BBC News' },
    { url: 'https://feeds.npr.org/1001/rss.xml', name: 'NPR' },
    { url: 'https://www.theguardian.com/world/rss', name: 'The Guardian' },
    { url: 'https://rss.politico.com/politics-news.xml', name: 'Politico' },
    { url: 'https://feeds.reuters.com/reuters/topNews', name: 'Reuters' },
    { url: 'https://abcnews.go.com/abcnews/topstories', name: 'ABC News' },
    { url: 'https://feeds.nbcnews.com/nbcnews/public/news', name: 'NBC News' },
  ],
  international: [
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', name: 'Al Jazeera' },
    { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', name: 'BBC World' },
    { url: 'https://rss.dw.com/rdf/rss-en-all', name: 'DW News' },
    { url: 'https://foreignpolicy.com/feed/', name: 'Foreign Policy' },
    { url: 'https://www.france24.com/en/rss', name: 'France 24' },
    { url: 'https://feeds.reuters.com/Reuters/worldNews', name: 'Reuters World' },
    { url: 'https://www.theguardian.com/world/rss', name: 'The Guardian' },
    { url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms', name: 'Times of India' },
  ],
  independent: [
    { url: 'https://voxunderground.substack.com/feed', name: 'The Underground' },
    { url: 'https://www.platformer.news/feed', name: 'Platformer' },
    { url: 'https://theintercept.com/feed/?rss', name: 'The Intercept' },
    { url: 'https://www.propublica.org/feeds/propublica/main', name: 'ProPublica' },
    { url: 'https://www.motherjones.com/feed/', name: 'Mother Jones' },
    { url: 'https://www.democracynow.org/democracynow.rss', name: 'Democracy Now' },
    { url: 'https://www.commondreams.org/rss.xml', name: 'Common Dreams' },
    { url: 'https://therealnews.com/feed', name: 'The Real News' },
  ],
  business: [
    { url: 'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml', name: 'Wall Street Journal' },
    { url: 'https://www.ft.com/?format=rss', name: 'Financial Times' },
    { url: 'https://fortune.com/feed/', name: 'Fortune' },
    { url: 'https://www.economist.com/finance-and-economics/rss.xml', name: 'The Economist' },
    { url: 'https://feeds.cnbc.com/rss/site/102/3096.rss', name: 'CNBC' },
    { url: 'https://feeds.bloomberg.com/markets/news.rss', name: 'Bloomberg' },
    { url: 'https://www.businessinsider.com/rss', name: 'Business Insider' },
    { url: 'https://www.forbes.com/real-time/feed2/', name: 'Forbes' },
  ],
  tech: [
    { url: 'https://www.technologyreview.com/feed/', name: 'MIT Tech Review' },
    { url: 'https://www.wired.com/feed/rss', name: 'Wired' },
    { url: 'https://feeds.arstechnica.com/arstechnica/index', name: 'Ars Technica' },
    { url: 'https://www.theverge.com/rss/index.xml', name: 'The Verge' },
    { url: 'https://techcrunch.com/feed/', name: 'TechCrunch' },
    { url: 'https://www.zdnet.com/news/rss.xml', name: 'ZDNet' },
    { url: 'https://feeds.feedburner.com/venturebeat/SZYF', name: 'VentureBeat' },
    { url: 'https://www.engadget.com/rss.xml', name: 'Engadget' },
  ],
  politics: [
    { url: 'https://rss.politico.com/politics-news.xml', name: 'Politico' },
    { url: 'https://thehill.com/rss/syndicator/19109', name: 'The Hill' },
    { url: 'https://feeds.npr.org/1001/rss.xml', name: 'NPR' },
    { url: 'https://www.theguardian.com/us-news/rss', name: 'The Guardian' },
    { url: 'https://www.rollcall.com/feed/', name: 'Roll Call' },
    { url: 'https://rss.politico.com/congress.xml', name: 'Politico Congress' },
    { url: 'https://feeds.reuters.com/Reuters/PoliticsNews', name: 'Reuters Politics' },
  ],
  opinion: [
    { url: 'https://www.theguardian.com/commentisfree/rss', name: 'The Guardian' },
    { url: 'https://www.economist.com/leaders/rss.xml', name: 'The Economist' },
    { url: 'https://foreignpolicy.com/category/analysis/feed/', name: 'Foreign Policy' },
    { url: 'https://theintercept.com/feed/?rss', name: 'The Intercept' },
    { url: 'https://www.theatlantic.com/feed/all/', name: 'The Atlantic' },
    { url: 'https://www.newyorker.com/feed/everything', name: 'The New Yorker' },
  ],
  alerts: [
    { url: 'https://feeds.apnews.com/rss/apf-topnews', name: 'AP News' },
    { url: 'https://feeds.bbci.co.uk/news/rss.xml', name: 'BBC News' },
    { url: 'https://feeds.reuters.com/reuters/topNews', name: 'Reuters' },
    { url: 'https://feeds.npr.org/1001/rss.xml', name: 'NPR' },
  ],
  science: [
    { url: 'https://www.theguardian.com/science/rss', name: 'The Guardian' },
    { url: 'https://www.technologyreview.com/feed/', name: 'MIT Tech Review' },
    { url: 'https://feeds.newscientist.com/science-news', name: 'New Scientist' },
    { url: 'https://www.scientificamerican.com/feed/', name: 'Scientific American' },
    { url: 'https://www.sciencenews.org/feed', name: 'Science News' },
    { url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', name: 'NASA' },
  ],
  health: [
    { url: 'https://feeds.npr.org/1128/rss.xml', name: 'NPR Health' },
    { url: 'https://www.theguardian.com/society/health/rss', name: 'The Guardian' },
    { url: 'https://www.statnews.com/feed/', name: 'STAT News' },
    { url: 'https://www.medicalnewstoday.com/rss/news', name: 'Medical News Today' },
    { url: 'https://feeds.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC', name: 'WebMD' },
  ],
  climate: [
    { url: 'https://www.theguardian.com/environment/rss', name: 'The Guardian' },
    { url: 'https://grist.org/feed/', name: 'Grist' },
    { url: 'https://insideclimatenews.org/feed/', name: 'Inside Climate News' },
    { url: 'https://www.climatecentral.org/feed', name: 'Climate Central' },
    { url: 'https://e360.yale.edu/feed', name: 'Yale Environment 360' },
  ],
  sports: [
    { url: 'https://www.espn.com/espn/rss/news', name: 'ESPN' },
    { url: 'https://www.theguardian.com/sport/rss', name: 'The Guardian' },
    { url: 'https://bleacherreport.com/articles/feed', name: 'Bleacher Report' },
    { url: 'https://www.cbssports.com/rss/headlines/', name: 'CBS Sports' },
    { url: 'https://theathletic.com/rss/', name: 'The Athletic' },
  ],
  entertainment: [
    { url: 'https://variety.com/feed/', name: 'Variety' },
    { url: 'https://deadline.com/feed/', name: 'Deadline' },
    { url: 'https://www.hollywoodreporter.com/feed/', name: 'Hollywood Reporter' },
    { url: 'https://pitchfork.com/rss/news/feed/r.xml', name: 'Pitchfork' },
    { url: 'https://www.rollingstone.com/music/music-news/feed/', name: 'Rolling Stone' },
  ],
};

const BEAT_FEEDS = {
  // Politics & Government
  politics:            [{ url: 'https://rss.politico.com/politics-news.xml', name: 'Politico' }, { url: 'https://thehill.com/rss/syndicator/19109', name: 'The Hill' }],
  congress:            [{ url: 'https://rss.politico.com/congress.xml', name: 'Politico Congress' }, { url: 'https://www.rollcall.com/feed/', name: 'Roll Call' }],
  elections:           [{ url: 'https://rss.politico.com/politics-news.xml', name: 'Politico' }, { url: 'https://feeds.reuters.com/Reuters/PoliticsNews', name: 'Reuters' }],
  'white house':       [{ url: 'https://rss.politico.com/politics-news.xml', name: 'Politico' }, { url: 'https://feeds.apnews.com/rss/apf-politics', name: 'AP Politics' }],
  senate:              [{ url: 'https://rss.politico.com/congress.xml', name: 'Politico' }, { url: 'https://www.rollcall.com/feed/', name: 'Roll Call' }],
  'supreme court':     [{ url: 'https://feeds.apnews.com/rss/apf-topnews', name: 'AP News' }, { url: 'https://rss.politico.com/politics-news.xml', name: 'Politico' }],
  diplomacy:           [{ url: 'https://foreignpolicy.com/feed/', name: 'Foreign Policy' }, { url: 'https://feeds.reuters.com/Reuters/worldNews', name: 'Reuters' }],
  immigration:         [{ url: 'https://feeds.apnews.com/rss/apf-topnews', name: 'AP News' }, { url: 'https://thehill.com/rss/syndicator/19109', name: 'The Hill' }],
  // Economy & Finance
  economy:             [{ url: 'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml', name: 'Wall Street Journal' }, { url: 'https://feeds.cnbc.com/rss/site/102/3096.rss', name: 'CNBC' }],
  markets:             [{ url: 'https://feeds.bloomberg.com/markets/news.rss', name: 'Bloomberg' }, { url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', name: 'WSJ Markets' }],
  business:            [{ url: 'https://fortune.com/feed/', name: 'Fortune' }, { url: 'https://www.businessinsider.com/rss', name: 'Business Insider' }],
  crypto:              [{ url: 'https://cointelegraph.com/rss', name: 'CoinTelegraph' }, { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', name: 'CoinDesk' }],
  'personal finance':  [{ url: 'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml', name: 'Wall Street Journal' }, { url: 'https://www.kiplinger.com/rss/feed/rss.xml', name: 'Kiplinger' }],
  'real estate':       [{ url: 'https://feeds.cnbc.com/rss/site/102/3096.rss', name: 'CNBC' }, { url: 'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml', name: 'Wall Street Journal' }],
  housing:             [{ url: 'https://feeds.cnbc.com/rss/site/102/3096.rss', name: 'CNBC' }, { url: 'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml', name: 'Wall Street Journal' }],
  // Technology
  technology:          [{ url: 'https://feeds.arstechnica.com/arstechnica/index', name: 'Ars Technica' }, { url: 'https://www.theverge.com/rss/index.xml', name: 'The Verge' }],
  ai:                  [{ url: 'https://www.technologyreview.com/feed/', name: 'MIT Tech Review' }, { url: 'https://feeds.feedburner.com/venturebeat/SZYF', name: 'VentureBeat' }],
  cybersecurity:       [{ url: 'https://feeds.arstechnica.com/arstechnica/security', name: 'Ars Technica' }, { url: 'https://krebsonsecurity.com/feed/', name: 'Krebs on Security' }],
  'big tech':          [{ url: 'https://www.theverge.com/rss/index.xml', name: 'The Verge' }, { url: 'https://techcrunch.com/feed/', name: 'TechCrunch' }],
  startups:            [{ url: 'https://techcrunch.com/feed/', name: 'TechCrunch' }, { url: 'https://feeds.feedburner.com/venturebeat/SZYF', name: 'VentureBeat' }],
  space:               [{ url: 'https://www.space.com/feeds/all', name: 'Space.com' }, { url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', name: 'NASA' }],
  gaming:              [{ url: 'https://www.ign.com/rss/articles', name: 'IGN' }, { url: 'https://kotaku.com/rss', name: 'Kotaku' }],
  media:               [{ url: 'https://www.theverge.com/rss/index.xml', name: 'The Verge' }, { url: 'https://www.niemanlab.org/feed/', name: 'Nieman Lab' }],
  // Science & Health
  science:             [{ url: 'https://feeds.newscientist.com/science-news', name: 'New Scientist' }, { url: 'https://www.scientificamerican.com/feed/', name: 'Scientific American' }],
  health:              [{ url: 'https://feeds.npr.org/1128/rss.xml', name: 'NPR Health' }, { url: 'https://www.statnews.com/feed/', name: 'STAT News' }],
  medicine:            [{ url: 'https://www.statnews.com/feed/', name: 'STAT News' }, { url: 'https://www.medicalnewstoday.com/rss/news', name: 'Medical News Today' }],
  climate:             [{ url: 'https://www.theguardian.com/environment/rss', name: 'The Guardian' }, { url: 'https://grist.org/feed/', name: 'Grist' }],
  environment:         [{ url: 'https://insideclimatenews.org/feed/', name: 'Inside Climate News' }, { url: 'https://e360.yale.edu/feed', name: 'Yale E360' }],
  energy:              [{ url: 'https://insideclimatenews.org/feed/', name: 'Inside Climate News' }, { url: 'https://www.theguardian.com/environment/rss', name: 'The Guardian' }],
  // World
  world:               [{ url: 'https://feeds.bbci.co.uk/news/world/rss.xml', name: 'BBC World' }, { url: 'https://feeds.reuters.com/Reuters/worldNews', name: 'Reuters' }],
  europe:              [{ url: 'https://feeds.bbci.co.uk/news/world/europe/rss.xml', name: 'BBC Europe' }, { url: 'https://rss.dw.com/rdf/rss-en-all', name: 'DW News' }],
  'middle east':       [{ url: 'https://www.aljazeera.com/xml/rss/all.xml', name: 'Al Jazeera' }, { url: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml', name: 'BBC Middle East' }],
  asia:                [{ url: 'https://feeds.bbci.co.uk/news/world/asia/rss.xml', name: 'BBC Asia' }, { url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms', name: 'Times of India' }],
  africa:              [{ url: 'https://feeds.bbci.co.uk/news/world/africa/rss.xml', name: 'BBC Africa' }, { url: 'https://www.aljazeera.com/xml/rss/all.xml', name: 'Al Jazeera' }],
  'latin america':     [{ url: 'https://feeds.bbci.co.uk/news/world/latin_america/rss.xml', name: 'BBC Latin America' }, { url: 'https://feeds.reuters.com/Reuters/worldNews', name: 'Reuters' }],
  ukraine:             [{ url: 'https://feeds.bbci.co.uk/news/world/europe/rss.xml', name: 'BBC Europe' }, { url: 'https://rss.dw.com/rdf/rss-en-all', name: 'DW News' }],
  china:               [{ url: 'https://feeds.bbci.co.uk/news/world/asia/rss.xml', name: 'BBC Asia' }, { url: 'https://foreignpolicy.com/feed/', name: 'Foreign Policy' }],
  // Culture & Society
  culture:             [{ url: 'https://www.theguardian.com/culture/rss', name: 'The Guardian' }, { url: 'https://www.theatlantic.com/feed/all/', name: 'The Atlantic' }],
  education:           [{ url: 'https://feeds.npr.org/1013/rss.xml', name: 'NPR Education' }, { url: 'https://www.theguardian.com/education/rss', name: 'The Guardian' }],
  religion:            [{ url: 'https://religionnews.com/feed/', name: 'Religion News Service' }, { url: 'https://feeds.npr.org/1001/rss.xml', name: 'NPR' }],
  'criminal justice':  [{ url: 'https://www.themarshallproject.org/rss/records?collection=news', name: 'Marshall Project' }, { url: 'https://feeds.apnews.com/rss/apf-topnews', name: 'AP News' }],
  // Sports
  sports:              [{ url: 'https://www.espn.com/espn/rss/news', name: 'ESPN' }, { url: 'https://www.theguardian.com/sport/rss', name: 'The Guardian' }],
  nba:                 [{ url: 'https://www.espn.com/espn/rss/nba/news', name: 'ESPN NBA' }, { url: 'https://bleacherreport.com/articles/feed', name: 'Bleacher Report' }],
  nfl:                 [{ url: 'https://www.espn.com/espn/rss/nfl/news', name: 'ESPN NFL' }, { url: 'https://bleacherreport.com/articles/feed', name: 'Bleacher Report' }],
  mlb:                 [{ url: 'https://www.espn.com/espn/rss/mlb/news', name: 'ESPN MLB' }, { url: 'https://bleacherreport.com/articles/feed', name: 'Bleacher Report' }],
  nhl:                 [{ url: 'https://www.espn.com/espn/rss/nhl/news', name: 'ESPN NHL' }, { url: 'https://bleacherreport.com/articles/feed', name: 'Bleacher Report' }],
  soccer:              [{ url: 'https://www.theguardian.com/football/rss', name: 'The Guardian' }, { url: 'https://www.espn.com/espn/rss/soccer/news', name: 'ESPN Soccer' }],
  tennis:              [{ url: 'https://www.theguardian.com/sport/tennis/rss', name: 'The Guardian' }, { url: 'https://www.espn.com/espn/rss/tennis/news', name: 'ESPN' }],
  golf:                [{ url: 'https://www.espn.com/espn/rss/golf/news', name: 'ESPN Golf' }, { url: 'https://www.golfdigest.com/rss/blogs/news-blog', name: 'Golf Digest' }],
  mma:                 [{ url: 'https://www.espn.com/espn/rss/mma/news', name: 'ESPN MMA' }, { url: 'https://bleacherreport.com/articles/feed', name: 'Bleacher Report' }],
  // Entertainment & Culture
  entertainment:       [{ url: 'https://variety.com/feed/', name: 'Variety' }, { url: 'https://deadline.com/feed/', name: 'Deadline' }],
  music:               [{ url: 'https://pitchfork.com/rss/news/feed/r.xml', name: 'Pitchfork' }, { url: 'https://www.rollingstone.com/music/music-news/feed/', name: 'Rolling Stone' }],
  film:                [{ url: 'https://variety.com/feed/', name: 'Variety' }, { url: 'https://www.hollywoodreporter.com/feed/', name: 'Hollywood Reporter' }],
  tv:                  [{ url: 'https://deadline.com/feed/', name: 'Deadline' }, { url: 'https://variety.com/feed/', name: 'Variety' }],
  books:               [{ url: 'https://www.theguardian.com/books/rss', name: 'The Guardian' }, { url: 'https://www.newyorker.com/feed/books', name: 'The New Yorker' }],
  food:                [{ url: 'https://www.theguardian.com/lifeandstyle/food-and-drink/rss', name: 'The Guardian' }, { url: 'https://feeds.feedburner.com/seriouseats/recipes', name: 'Serious Eats' }],
  travel:              [{ url: 'https://www.theguardian.com/travel/rss', name: 'The Guardian' }, { url: 'https://www.cntraveler.com/feed/rss', name: 'Conde Nast Traveler' }],
  // Opinion & Analysis
  opinion:             [{ url: 'https://www.theguardian.com/commentisfree/rss', name: 'The Guardian' }, { url: 'https://www.theatlantic.com/feed/all/', name: 'The Atlantic' }],
  analysis:            [{ url: 'https://foreignpolicy.com/feed/', name: 'Foreign Policy' }, { url: 'https://www.economist.com/leaders/rss.xml', name: 'The Economist' }],
  // Catch-all
  breaking:            [{ url: 'https://feeds.apnews.com/rss/apf-topnews', name: 'AP News' }, { url: 'https://feeds.reuters.com/reuters/topNews', name: 'Reuters' }],
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
      const cleanTitle = title.replace(/[---]/g, ',').replace(/\s+/g, ' ').trim();
      const cleanSummary = (cleanDesc || 'Read the full story.').replace(/[---]/g, ',');
      items.push({
        headline: cleanTitle,
        summary: cleanSummary + (cleanDesc.length >= 220 ? '...' : ''),
        source: sourceName,
        time: formatTime(pubDate),
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
  const m = xml.match(new RegExp('<' + tag + '[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/' + tag + '>', 'i'));
  return m ? m[1].trim() : '';
}

function extractLink(item) {
  const m = item.match(/<link[^>]*>([^<]+)<\/link>/)
    || item.match(/<link[^>]+href="([^"]+)"/)
    || item.match(/<guid[^>]*>([^<]+)<\/guid>/);
  return m ? m[1].trim() : '';
}

function formatTime(pubDate) {
  if (!pubDate) return '';
  try {
    const diff = Date.now() - new Date(pubDate).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (d > 0) return d + 'd ago';
    if (h > 0) return h + 'h ago';
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
      feeds = CHANNEL_FEEDS[channel].slice(0, 6);
    } else if (beats) {
      const beatList = beats.split(',').map(b => b.trim().toLowerCase());
      const seen = new Set();
      feeds.push({ url: 'https://feeds.apnews.com/rss/apf-topnews', name: 'AP News' });
      seen.add('feeds.apnews.com');
      beatList.forEach(beat => {
        const sources = BEAT_FEEDS[beat];
        if (sources) {
          sources.forEach(f => {
            try {
              const host = new URL(f.url).hostname;
              if (!seen.has(host)) { seen.add(host); feeds.push({...f, beat: beat}); }
            } catch(e) {}
          });
        }
      });
      if (feeds.length < 2) {
        feeds.push({ url: 'https://feeds.reuters.com/reuters/topNews', name: 'Reuters' });
        feeds.push({ url: 'https://feeds.bbci.co.uk/news/rss.xml', name: 'BBC News' });
      }
      feeds = feeds.slice(0, 7);
    } else {
      feeds = CHANNEL_FEEDS.mainstream.slice(0, 6);
    }

    const results = 
  // Build source->beat map from feeds array
  const _srcBeat = {};
  feeds.forEach(f => { if (f.name && f.beat) _srcBeat[f.name] = f.beat; });

  await Promise.allSettled(
      feeds.map(f => fetchRSS(f.url, f.name))
    );

    const seen = new Set();
    let articles = [];
    results.forEach(r => {
      if (r.status === 'fulfilled') {
        r.value.forEach(a => {
          const key = a.headline.slice(0, 50).toLowerCase().replace(/[^a-z0-9]/g, '');
          if (!seen.has(key) && a.headline.length > 10) {
            seen.add(key);
            a.beat = _srcBeat[a.source] || 'general'; articles.push(a);
          }
        });
      }
    });

    articles.sort((a, b) => {
      if (a.time.includes('d') && !b.time.includes('d')) return 1;
      if (!a.time.includes('d') && b.time.includes('d')) return -1;
      return (parseInt(a.time) || 0) - (parseInt(b.time) || 0);
    });

    articles = articles.slice(0, 20);

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
