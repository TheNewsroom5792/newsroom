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

  try {
    // ── CREATE CHECKOUT SESSION ───────────────────────────
    if (action === 'checkout') {
      const { plan, email, userId } = req.body;
      const isAnnual = plan === 'annual';

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: email,
        metadata: { userId, plan },
        line_items: [{
          price_data: {
            currency: 'usd',
            recurring: { interval: isAnnual ? 'year' : 'month' },
            product_data: {
              name: 'Headlines Report Pro',
              description: 'Unlimited beats, Substacks, and your morning briefing'
            },
            unit_amount: isAnnual ? 6000 : 700
          },
          quantity: 1
        }],
        success_url: `https://headlinesreport.com/app?upgraded=true`,
        cancel_url: `https://headlinesreport.com/app`
      });

      return res.status(200).json({ url: session.url });
    }

    // ── STRIPE WEBHOOK (confirm payment) ─────────────────
    if (action === 'webhook') {
      const sig = req.headers['stripe-signature'];
      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      } catch (err) {
        return res.status(400).json({ error: 'Webhook signature failed' });
      }

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        if (userId) {
          await supabase.from('profiles').update({
            tier: 'pro',
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            pro_since: new Date().toISOString()
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
    }

    return res.status(400).json({ error: 'Unknown action' });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
