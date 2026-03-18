import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action } = req.query;

  // -- CHECKOUT: create a Stripe checkout session --
  if (action === 'checkout') {
    try {
      const { plan, userId, email } = req.body;

      let priceId, mode, successUrl, cancelUrl;

      if (plan === 'monthly') {
        priceId = process.env.STRIPE_MONTHLY_PRICE_ID;
        mode = 'subscription';
      } else if (plan === 'yearly') {
        priceId = process.env.STRIPE_YEARLY_PRICE_ID;
        mode = 'subscription';
      } else if (plan === 'fresh_start') {
        priceId = process.env.STRIPE_FRESH_START_PRICE_ID;
        mode = 'payment';
      } else {
        return res.status(400).json({ error: 'Invalid plan' });
      }

      successUrl = plan === 'fresh_start'
        ? 'https://headlinesreport.com/fresh-start.html?success=true'
        : 'https://headlinesreport.com/app.html?upgraded=true';
      cancelUrl = plan === 'fresh_start'
        ? 'https://headlinesreport.com/fresh-start.html'
        : 'https://headlinesreport.com/app.html';

      const sessionParams = {
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { userId: userId || '', plan },
      };

      if (email) sessionParams.customer_email = email;
      if (mode === 'subscription') {
        sessionParams.subscription_data = { metadata: { userId: userId || '' } };
      }

      const session = await stripe.checkout.sessions.create(sessionParams);
      return res.status(200).json({ url: session.url });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // -- WEBHOOK: handle Stripe events --
  if (action === 'webhook') {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      const rawBody = await getRawBody(req);
      event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).json({ error: 'Webhook signature failed: ' + err.message });
    }

    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (userId && plan !== 'fresh_start') {
          await supabase.from('profiles').update({
            tier: 'pro',
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            pro_since: new Date().toISOString(),
          }).eq('id', userId);
        }
      }

      if (event.type === 'customer.subscription.deleted') {
        const sub = event.data.object;
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_subscription_id', sub.id);
        if (profiles?.length) {
          await supabase.from('profiles').update({ tier: 'free' }).eq('id', profiles[0].id);
        }
      }

      return res.status(200).json({ received: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(400).json({ error: 'Unknown action' });
}

// Read raw body for Stripe webhook signature verification
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}
