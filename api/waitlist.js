export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    // Add to Resend Audience
    const response = await fetch(`https://api.resend.com/audiences/${process.env.RESEND_AUDIENCE_ID}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        email,
        unsubscribed: false
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Contact may already exist , treat as success
      if (data.name === 'validation_error' || response.status === 409) {
        return res.status(200).json({ success: true, message: 'Already on the list' });
      }
      return res.status(response.status).json({ error: data.message || 'Failed to add contact' });
    }

    // Send a welcome confirmation email
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL || 'morning@headlinesreport.com',
        to: [email],
        subject: "You're on the Headlines Report waitlist",
        html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f7f4ee;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4ee;padding:40px 16px;">
<tr><td align="center">
<table width="540" cellpadding="0" cellspacing="0" style="max-width:540px;width:100%;background:#ffffff;border:1px solid #d4cfc4;">

  <tr><td style="background:#0f0e0c;padding:28px 36px 24px;text-align:center;border-bottom:3px double #0f0e0c;">
    <p style="margin:0;font-family:Georgia,serif;font-size:28px;font-style:italic;font-weight:900;color:#ffffff;letter-spacing:-1px;">Headlines<span style="font-weight:400;color:#c1440e;">Report</span></p>
    <p style="margin:6px 0 0;font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:2px;font-family:monospace;text-transform:uppercase;">Early Access Confirmation</p>
  </td></tr>

  <tr><td style="padding:36px 36px 20px;">
    <p style="margin:0 0 16px;font-size:22px;font-weight:700;line-height:1.2;color:#0f0e0c;">You're on the list.</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#3d3b36;font-weight:300;">Thanks for signing up for early access to Headlines Report , your morning briefing, rebuilt.</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#3d3b36;font-weight:300;">When we open the doors, you'll be first in. Early access members get their <strong>first month free</strong>.</p>
    <p style="margin:0;font-size:15px;line-height:1.7;color:#3d3b36;font-weight:300;">In the meantime , stay curious.</p>
  </td></tr>

  <tr><td style="padding:0 36px 36px;">
    <table cellpadding="0" cellspacing="0" style="border-top:1px solid #d4cfc4;padding-top:20px;width:100%;">
      <tr>
        <td style="padding-right:20px;">
          <p style="margin:0 0 4px;font-family:monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#7a7567;">What you're getting</p>
          <p style="margin:0;font-size:13px;line-height:1.6;color:#3d3b36;">One feed for all your beats, Substacks, and a curated morning digest , delivered to your inbox by 7am.</p>
        </td>
      </tr>
    </table>
  </td></tr>

  <tr><td style="background:#f7f4ee;padding:16px 36px;border-top:1px solid #d4cfc4;text-align:center;">
    <tr><td style="background:#f0ece3;padding:12px 36px;border-top:1px solid #d4cfc4;"><p style="margin:0 0 3px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#7a7567;font-family:monospace;">From the community</p><p style="margin:0;font-size:12px;line-height:1.6;color:#3d3b36;">The Underground is where citizens push back on the narratives that shape our world. <a href="https://voxunderground.substack.com" style="color:#c1440e;">Join Vox Populi.</a></p></td></tr><tr><td style="background:#f7f4ee;padding:16px 36px;border-top:1px solid #d4cfc4;text-align:center;"><p style="margin:0;font-family:monospace;font-size:9px;letter-spacing:1px;color:#7a7567;">© 2025 Headlines Report · <a href="#" style="color:#7a7567;">Unsubscribe</a></p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
      })
    });

    return res.status(200).json({ success: true, id: data.id });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
