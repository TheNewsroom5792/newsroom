import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { email, token } = req.query;

  if (!email) {
    return res.status(400).send('<html><body style="font-family:Georgia,serif;max-width:500px;margin:80px auto;text-align:center;"><h2>Invalid unsubscribe link.</h2><p><a href="https://headlinesreport.com">Return to Headlines Report</a></p></body></html>');
  }

  try {
    // Disable digest for this user
    await supabase.from('profiles')
      .update({ digest_enabled: false })
      .eq('email', decodeURIComponent(email));

    // Mark unsubscribed in Resend audience
    await fetch('https://api.resend.com/audiences/' + process.env.RESEND_AUDIENCE_ID + '/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.RESEND_API_KEY },
      body: JSON.stringify({ email: decodeURIComponent(email), unsubscribed: true })
    });

    return res.status(200).send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"/><title>Unsubscribed, Headlines Report</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Mono:wght@400&display=swap" rel="stylesheet"/>
</head><body style="background:#f7f4ee;font-family:Georgia,serif;max-width:540px;margin:0 auto;padding:80px 24px;text-align:center;">
<div style="font-family:'Playfair Display',serif;font-size:32px;font-weight:700;margin-bottom:24px;">Headlines<em style="font-weight:400;color:#c1440e;">Report</em></div>
<div style="border-top:3px double #0f0e0c;border-bottom:3px double #0f0e0c;padding:32px 0;margin-bottom:32px;">
<h1 style="font-family:'Playfair Display',serif;font-size:24px;font-weight:700;margin-bottom:12px;">You have been unsubscribed.</h1>
<p style="font-size:15px;line-height:1.7;color:#3d3b36;">You will no longer receive morning digest emails from Headlines Report. You can re-enable them anytime in your account settings.</p>
</div>
<a href="https://headlinesreport.com/app.html" style="font-family:'DM Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:12px 24px;background:#0f0e0c;color:#f7f4ee;text-decoration:none;display:inline-block;">Go to app</a>
</body></html>`);
  } catch(err) {
    return res.status(500).send('<html><body>Error: ' + err.message + '</body></html>');
  }
}
