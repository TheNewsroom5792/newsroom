import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    // 1. Add to Resend audience
    await fetch('https://api.resend.com/audiences/' + process.env.RESEND_AUDIENCE_ID + '/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.RESEND_API_KEY },
      body: JSON.stringify({ email, unsubscribed: false })
    });

    // 2. Upsert into Supabase waitlist table
    await supabase.from('waitlist').upsert({ email, joined_at: new Date().toISOString() }, { onConflict: 'email' });

    // 3. Send confirmation email
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.RESEND_API_KEY },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL || 'morning@headlinesreport.com',
        to: [email],
        subject: "You're on the Headlines Report waitlist",
        html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#f7f4ee;padding:0;">
          <div style="background:#0f0e0c;padding:24px;text-align:center;">
            <p style="margin:0;font-family:Georgia,serif;font-size:24px;font-style:italic;font-weight:900;color:#fff;">Headlines<span style="font-weight:400;color:#c1440e;">Report</span></p>
          </div>
          <div style="padding:32px 28px;background:white;margin:0;">
            <p style="font-family:Georgia,serif;font-size:20px;font-weight:700;margin:0 0 16px;">You are on the list.</p>
            <p style="font-size:14px;line-height:1.7;color:#3d3b36;margin:0 0 14px;">We will be in touch soon with early access to Headlines Report: your morning news briefing, built around the beats you actually follow.</p>
            <p style="font-size:14px;line-height:1.7;color:#3d3b36;margin:0 0 24px;">While you wait, check out <a href="https://voxunderground.substack.com" style="color:#c1440e;">The Underground</a>, our flagship Substack covering politics and power.</p>
            <div style="border-top:1px solid #d4cfc4;padding-top:20px;margin-top:8px;">
              <p style="font-size:11px;color:#7a7567;font-family:monospace;margin:0;">Headlines Report, headlinesreport.com</p>
            </div>
          </div>
        </div>`
      })
    });

    return res.status(200).json({ success: true });
  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
}
