// Vercel Function: set RESEND_API_KEY, CONTACT_FROM and CONTACT_TO in project settings.
// No fabricated success response: without a configured provider, return HTTP 503.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error:'Method not allowed.' }); }
  const body = typeof req.body === 'object' && req.body ? req.body : {};
  const { name, email, message, plan } = body;
  if (![name,email,message].every(v => typeof v === 'string') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || name.trim().length < 2 || message.trim().length < 2 || name.length > 120 || email.length > 200 || message.length > 3000 || (plan && (typeof plan !== 'string' || plan.length > 100))) {
    return res.status(400).json({ error:'Please provide a valid name, email and message.' });
  }
  const apiKey = process.env.RESEND_API_KEY, from = process.env.CONTACT_FROM, to = process.env.CONTACT_TO;
  if (!apiKey || !from || !to) return res.status(503).json({ error:'Enquiry delivery is not configured yet.' });
  const clean = value => value.replace(/[<>]/g, '').replace(/[\r\n]+/g, ' ').trim();
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method:'POST', headers:{ Authorization:`Bearer ${apiKey}`, 'Content-Type':'application/json' },
      body: JSON.stringify({ from, to:[to], subject:`Plura enquiry — ${clean(name).slice(0,100)}`, reply_to:clean(email), text:`Name: ${name}\nEmail: ${email}\nInterested in: ${plan || 'General enquiry'}\n\n${message}` })
    });
    if (!response.ok) {
      console.error('Contact provider failed with status', response.status);
      return res.status(502).json({ error:'The email provider could not deliver the message.' });
    }
    return res.status(200).json({ success:true });
  } catch (e) {
    console.error('Contact service unavailable:', e?.message);
    return res.status(502).json({ error:'The email service is temporarily unavailable.' });
  }
}
