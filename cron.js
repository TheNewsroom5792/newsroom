import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function fetchRealArticles(beats) {
  try {
    const beatParam = beats.slice(0, 6).map(b => b.toLowerCase()).join(',');
    const res = await fetch(
      `https://headlinesreport.com/api/feed?beats=${encodeURIComponent(beatParam)}`,
      { headers: { 'User-Agent': 'HeadlinesReport-Cron/1.0' } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.articles || []).slice(0, 12);
  } catch (e) {
    return [];
  }
}

export default async function handler(req, res) {
  const auth = req.headers.authorization?.replace('Bearer ', '');
  if (auth !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const currentHour = new Date().getUTCHours();

  try {
    const { data: users } = await supabase
      .from('profiles')
      .select('id, email, beats, substacks, digest_time, referral_credits, tier')
      .eq('digest_enabled', true);

    if (!users?.length) return res.status(200).json({ sent: 0, message: 'No eligible users' });

    const eligible = users.filter(u => {
      const t = u.digest_time || '07:00';
      return t.split(':')[0] === String(currentHour).padStart(2, '0');
    });

    if (!eligible.length) return res.status(200).json({ sent: 0, message: 'No users scheduled for ' + currentHour + ':00 UTC' });

    let sent = 0;
    const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    for (const user of eligible) {
      try {
        const beats = user.beats?.length ? user.beats : ['Politics', 'Economy', 'Technology'];
        const articles = await fetchRealArticles(beats);

        // Pass full article data including URLs into the prompt so Claude never needs to guess them
        const articleSummary = articles.length > 0
          ? articles.map((a, i) => `[${i}] ${a.headline} (${a.source}) | url: ${a.url || '#'}`).join('\n')
          : '(No live articles available, write a general digest)';

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
              content: `You are writing a morning news digest email called "The Morning Moose" for a reader interested in: ${beats.slice(0, 6).join(', ')}.

Here are today's real headlines (each has an index and a url — use them exactly):
${articleSummary}

Write a digest using ONLY these real stories. Do not invent headlines. No em dashes, use commas instead.
For each story, copy the url field EXACTLY as provided — do not alter, shorten, or omit it.
Return JSON only, no markdown, no backticks:
{"digest":"2-3 sentence overview of today's news","sections":[{"beat":"Beat Name","color":"#c1440e","stories":[{"headline":"exact headline from above","summary":"1-2 sentence summary","source":"source name from above","url":"exact url from above"}]}]}`
            }]
          })
        });

        const claudeData = await claudeRes.json();
        const raw = claudeData.content.map(c => c.text || '').join('').replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(raw);

        // Build email HTML — URLs come directly from Claude's output (which got them from our prompt)
        let sectionsHTML = '';
        parsed.sections.forEach(sec => {
          sectionsHTML += `<p style="margin:14px 0 6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${sec.color};font-family:monospace;">${sec.beat}</p>`;
          sec.stories.forEach(s => {
            const href = s.url && s.url !== '#' ? s.url : '#';
            sectionsHTML += `<div style="padding:8px 0;border-bottom:1px solid #f0ede8;">
  <a href="${href}" target="_blank" rel="noopener" style="text-decoration:none;">
    <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:15px;color:#1a1a1a;line-height:1.4;">${s.headline}</p>
  </a>
  <p style="margin:0 0 2px;font-size:12px;color:#555;line-height:1.5;">${s.summary}</p>
  <p style="margin:0;font-size:10px;color:#999;font-family:monospace;">${s.source}</p>
</div>`;
          });
        });

        const html = `<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;background:#f7f4ee;">
  <div style="background:#0f0e0c;padding:22px;text-align:center;">
    <p style="margin:0 0 2px;font-family:Georgia,serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.4);">The</p>
    <p style="margin:0;font-family:Georgia,serif;font-size:28px;font-style:italic;font-weight:900;color:#fff;">Morning <span style="font-weight:400;color:#c1440e;">Moose</span></p>
    <p style="margin:6px 0 0;font-size:10px;color:rgba(255,255,255,0.4);font-family:monospace;letter-spacing:1px;">${date.toUpperCase()}</p>
    <p style="margin:4px 0 0;font-size:10px;color:rgba(255,255,255,0.3);font-family:monospace;letter-spacing:1px;">By Moose</p>
    <div style="padding:14px 22px;text-align:center;border-top:1px solid rgba(255,255,255,0.08);margin-top:8px;">
      <p style="font-size:10px;color:#aaa;font-family:monospace;margin:0;">
        <a href="https://headlinesreport.com/app.html" style="color:#aaa;">Open app</a>
        &nbsp;&middot;&nbsp;
        <a href="https://headlinesreport.com/unsubscribe?email=${encodeURIComponent(user.email)}" style="color:#aaa;">Unsubscribe</a>
      </p>
    </div>
  </div>
  <div style="background:#f9f7f2;padding:16px 22px;border-bottom:1px solid #ece8df;">
    <p style="margin:0 0 5px;font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:#999;font-family:monospace;">Morning Digest</p>
    <p style="margin:0;font-size:14px;line-height:1.7;color:#444;">${parsed.digest}</p>
  </div>
  <div style="padding:6px 22px 20px;">${sectionsHTML}</div>
  <div style="background:#0f0e0c;padding:18px 22px;text-align:center;">
    <p style="margin:0 0 8px;font-size:10px;color:rgba(255,255,255,0.4);font-family:monospace;letter-spacing:1px;">YOUR BEATS: ${beats.slice(0, 5).join(', ').toUpperCase()}</p>
    <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.3);font-family:monospace;">The Underground, our Substack on politics and power: <a href="https://voxunderground.substack.com" style="color:#c1440e;">voxunderground.substack.com</a></p>
  </div>
</div>`;

        const sendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.RESEND_API_KEY
          },
          body: JSON.stringify({
            from: `Moose at Headlines Report <${process.env.FROM_EMAIL || 'moose@headlinesreport.com'}>`,
            to: [user.email],
            subject: 'The Morning Moose: ' + date,
            html
          })
        });

        if (!sendRes.ok) {
          const errData = await sendRes.json();
          console.error('Resend error for', user.email, errData);
        } else {
          sent++;
        }
      } catch (userErr) {
        console.error('Digest error for', user.email, userErr.message);
      }
    }

    return res.status(200).json({ success: true, sent, total: eligible.length, date });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
