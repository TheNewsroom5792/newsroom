# Headlines Report

Live at [headlinesreport.com](https://headlinesreport.com)

## Stack
- **Frontend**: Vanilla HTML/CSS/JS on Vercel
- **Backend**: Vercel serverless API routes (Node.js)
- **Database + Auth**: Supabase
- **Payments**: Stripe (live mode)
- **Email**: Resend (domain: headlinesreport.com)
- **RSS**: Direct server-side fetching, 100+ sources

## Pages
- `/` — Landing page + waitlist
- `/app` — Full app (auth, feed, channels, saved, settings)
- `/admin` — Admin dashboard
- `/fresh-start` — Fresh Start Financial Plan ($5)
- `/privacy` — Privacy Policy
- `/terms` — Terms of Service

## API Routes
| Route | Description |
|-------|-------------|
| `/api/auth` | Signup, signin, profile, save prefs |
| `/api/feed` | RSS aggregator (100+ sources, 50+ beats) |
| `/api/channels` | Channel subscription management |
| `/api/stripe` | Checkout sessions + webhook |
| `/api/waitlist` | Waitlist signup (Resend + Supabase) |
| `/api/cron` | Morning digest (called by GitHub Actions) |
| `/api/admin` | Admin dashboard backend |
| `/api/referral` | Referral code generation + credit system |
| `/api/track` | Article click tracking + trending |
| `/api/send` | Resend email proxy |

## Environment Variables (Vercel)
```
RESEND_API_KEY
FROM_EMAIL
RESEND_AUDIENCE_ID
SUPABASE_URL
SUPABASE_SERVICE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_MONTHLY_PRICE_ID
STRIPE_YEARLY_PRICE_ID
STRIPE_FRESH_START_PRICE_ID
ANTHROPIC_API_KEY
CRON_SECRET
ADMIN_SECRET
```

## GitHub Actions Cron
The morning digest runs via `.github/workflows/digest-cron.yml` at 7am UTC daily.
Add `CRON_SECRET` to your GitHub repo secrets (Settings > Secrets > Actions).

## Supabase Tables
- `profiles` — users, tier, beats, substacks, referral data
- `saved_articles` — user-saved articles
- `article_clicks` — click tracking for trending
- `waitlist` — pre-signup email list

## Features
- Beat-based feed, 50+ topic categories
- 8 curated channels
- Substack RSS integration
- Bias tracker (AllSides/Ad Fontes)
- Free tier: 3 beats, 2 Substacks, 1 refresh/day
- Pro: $7/mo or $60/yr, unlimited everything + morning email
- Referral system: both parties get 1 free month
- 3-step onboarding flow
- Beat suggestions
- Trending articles widget
- PWA installable (manifest + service worker)
- Fresh Start Financial Plan ($5 one-time)
