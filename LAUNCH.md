# Headlines Report: Launch Checklist

## Completed
- [x] Stripe live mode (sk_live_... keys in Vercel)
- [x] Live products: Pro Monthly ($7), Pro Yearly ($60), Fresh Start ($5)
- [x] Stripe webhook configured at headlinesreport.com/api/stripe?action=webhook
- [x] Supabase tables: profiles, saved_articles, article_clicks, waitlist
- [x] Supabase referral columns: referral_code, referred_by, referral_credits, referred_count
- [x] Resend domain verified (headlinesreport.com)
- [x] All Vercel env vars set
- [x] PWA manifest + service worker (offline support, installable)
- [x] Open Graph meta tags (social sharing)
- [x] 3-step onboarding flow
- [x] Referral system end-to-end
- [x] Beat suggestions bar
- [x] Trending articles widget
- [x] Click tracking (article_clicks table)
- [x] Clean URLs: /app, /admin, /fresh-start, /privacy, /terms
- [x] 404 page
- [x] Privacy Policy + Terms of Service
- [x] GitHub Actions cron (digest-cron.yml + health-check.yml)
- [x] Admin dashboard: waitlist count, referral leaderboard

## Still Needed Before Full Launch

### Critical
- [ ] Add CRON_SECRET to GitHub repo secrets (Settings > Secrets > Actions)
  - Same value as the CRON_SECRET in your Vercel env vars
- [ ] Verify Stripe webhook is receiving events (Stripe Dashboard > Developers > Webhooks)
- [ ] Test a real Pro signup end-to-end (use a real card)
- [ ] Test morning digest sends correctly (Admin > Test Digest)

### Nice to Have
- [ ] Custom OG image PNG (currently SVG - some platforms prefer PNG)
  - Generate at: https://og-playground.vercel.app or similar
- [ ] Real PWA icons (PNG 192x192 and 512x512)
  - Currently using SVG which works in most browsers
- [ ] Google Analytics or Plausible for traffic tracking
- [ ] Custom error emails (Sentry or similar for API errors)

## Going Live Steps
1. Announce on The Underground Substack (voxunderground.substack.com)
2. Share referral link on social media
3. Monitor admin dashboard for signups + errors
4. Watch Stripe dashboard for first payments

## Key URLs
- Live site: https://headlinesreport.com
- App: https://headlinesreport.com/app
- Admin: https://headlinesreport.com/admin
- Fresh Start: https://headlinesreport.com/fresh-start
- GitHub: https://github.com/TheNewsroom5792/newsroom
- Vercel: https://vercel.com/mooses-projects-f62b867e/newsroom
- Supabase: https://supabase.com/dashboard/project/uqredrgbwzmyvlpgwyhd
- Stripe: https://dashboard.stripe.com

## Monthly Maintenance
- Check admin dashboard for user growth + MRR
- Review trending articles to understand what users click
- Monitor referral leaderboard for top advocates
- Update beat feeds if any RSS URLs break
