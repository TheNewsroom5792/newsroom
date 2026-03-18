import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  // Auth check
  const auth = req.headers.authorization?.replace('Bearer ', '');
  if (auth !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const currentHour = new Date().getUTCHours();
  const currentMin = new Date().getUTCMinutes();
  const timeStr = String(currentHour).padStart(2,'0') + ':' + String(currentMin).padStart(2,'0');

  try {
    // Get all Pro users with digest enabled, whose delivery time matches current hour
    const { data: users } = await supabase
      .from('profiles')
      .select('id, email, beats, substacks, digest_time, referral_credits, tier')
      .eq('digest_enabled', true)
      .eq('tier', 'pro');

    if (!users?.length) return res.status(200).json({ sent: 0, message: 'No eligible users' });

    // Filter to users whose digest_time hour matches current UTC hour
    const eligible = users.filter(u => {
      const t = u.digest_time || '07:00';
      return t.split(':')[0] === String(currentHour).padStart(2,'0');
    });

    if (!eligible.length) return res.status(200).json({ sent: 0, message: 'No users scheduled for ' + currentHour + ':00 UTC' });

    let sent = 0;
    const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    for (const user of eligible) {
      try {
        const beats = user.beats?.length ? user.beats : ['Politics', 'Economy', 'Technology'];

        // Generate digest via Claude
        const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1200,
            messages: [{
              role: 'user',
              content: 'Write a morning news digest for these beats: ' + beats.slice(0,6).join(', ') + '. No em dashes. Use commas instead. Return JSON only: {"digest":"2-3 sentence overview","sections":[{"beat":"name","color":"#c1440e","stories":[{"headline":"...","summary":"...","source":"...","url":"#"}]}]}'
            }]
          })
        });
        const claudeData = await claudeRes.json();
        const raw = claudeData.content.map(c => c.text||'').join('').replace(/```json|```/g,'').trim();
        const parsed = JSON.parse(raw);

        // Build email HTML
        let sectionsHTML = '';
        parsed.sections.forEach(sec => {
          sectionsHTML += '<p style="margin:14px 0 6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:' + sec.color + ';font-family:monospace;">' + sec.beat + '</p>';
          sec.stories.forEach(s => {
            sectionsHTML += '<div style="padding:8px 0;border-bottom:1px solid #f0ede8;"><a href="' + (s.url||'#') + '" style="text-decoration:none;"><p style="margin:0 0 4px;font-family:Georgia,serif;font-size:15px;color:#1a1a1a;line-height:1.4;">' + s.headline + '</p></a><p style="margin:0 0 2px;font-size:12px;color:#555;line-height:1.5;">' + s.summary + '</p><p style="margin:0;font-size:10px;color:#999;font-family:monospace;">' + s.source + '</p></div>';
          });
        });

        const html = '<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;background:#f7f4ee;">' +
          '<div style="background:#0f0e0c;padding:22px;text-align:center;">' +
          '<p style="margin:0;font-family:Georgia,serif;font-size:24px;font-style:italic;font-weight:900;color:#fff;">Headlines<span style="font-weight:400;color:#c1440e;">Report</span></p>' +
          '<p style="margin:6px 0 0;font-size:10px;color:rgba(255,255,255,0.4);font-family:monospace;letter-spacing:1px;">' + date.toUpperCase() + '</p>' +
          '</div>' +
          '<div style="background:#f9f7f2;padding:16px 22px;border-bottom:1px solid #ece8df;">' +
          '<p style="margin:0 0 5px;font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:#999;font-family:monospace;">Morning Digest</p>' +
          '<p style="margin:0;font-size:14px;line-height:1.7;color:#444;">' + parsed.digest + '</p>' +
          '</div>' +
          '<div style="padding:6px 22px 20px;">' + sectionsHTML + '</div>' +
          '<div style="background:#0f0e0c;padding:18px 22px;text-align:center;">' +
          '<p style="margin:0 0 8px;font-size:10px;color:rgba(255,255,255,0.4);font-family:monospace;letter-spacing:1px;">YOUR BEATS: ' + beats.slice(0,5).join(', ').toUpperCase() + '</p>' +
          '<p style="margin:0;font-size:11px;color:rgba(255,255,255,0.3);font-family:monospace;">The Underground, our Substack on politics and power: <a href="https://voxunderground.substack.com" style="color:#c1440e;">voxunderground.substack.com</a></p>' +
          '</div>' +
          '</div>';

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.RESEND_API_KEY },
          body: JSON.stringify({
            from: process.env.FROM_EMAIL || 'morning@headlinesreport.com',
            to: [user.email],
            subject: 'Your Headlines Report: ' + date,
            html
          })
        });
        sent++;
      } catch(userErr) {
        console.error('Digest error for', user.email, userErr.message);
      }
    }

    return res.status(200).json({ success: true, sent, total: eligible.length, date });

  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
}
