# Headlines Report: Launch Checklist

## Completed
- [x] Stripe live mode, all 3 products wired
- [x] Supabase tables: profiles, saved_articles, article_clicks, waitlist
- [x] Supabase referral columns: referral_code, referred_by, referral_credits, referred_count
- [x] Resend domain verified (headlinesreport.com)
- [x] All Vercel env vars set
- [x] PWA manifest + service worker (offline support, installable)
- [x] Open Graph + Twitter card meta tags
- [x] 3-step onboarding flow
- [x] Referral system end-to-end
- [x] Beat suggestions bar
- [x] Trending articles widget
- [x] Click tracking (article_clicks table)
- [x] Clean URLs: /app, /admin, /fresh-start, /privacy, /terms, /contact, /unsubscribe
- [x] 404 page
- [x] Privacy Policy + Terms of Service
- [x] Contact page with form
- [x] GitHub Actions cron (digest at 7am UTC + health check every 6h)
- [x] Admin dashboard: waitlist count, referral leaderboard, referral columns
- [x] Unsubscribe handler (one-click from email footer)
- [x] Rate limiting on signup + waitlist endpoints
- [x] robots.txt + sitemap.xml
- [x] Email unsubscribe link in every digest

## ONE REMAINING MANUAL STEP
**Add CRON_SECRET to GitHub Actions:**
1. Go to: https://github.com/TheNewsroom5792/newsroom/settings/secrets/actions
2. Click "New repository secret"
3. Name: CRON_SECRET
4. Value: (copy the CRON_SECRET value from your Vercel env vars)
5. Click "Add secret"

That's it. The daily digest will then run automatically at 7am UTC for free.

## Key URLs
- Live site: https://headlinesreport.com
- App: https://headlinesreport.com/app
- Admin: https://headlinesreport.com/admin
- Fresh Start: https://headlinesreport.com/fresh-start
- Contact: https://headlinesreport.com/contact
- GitHub Actions: https://github.com/TheNewsroom5792/newsroom/actions
- Vercel: https://vercel.com/mooses-projects-f62b867e/newsroom
- Supabase: https://supabase.com/dashboard/project/uqredrgbwzmyvlpgwyhd
- Stripe: https://dashboard.stripe.com

## Monthly Maintenance
- Review admin dashboard: users, MRR, waitlist growth
- Check GitHub Actions: confirm digests are sending daily
- Review trending articles: understand what users click
- Monitor referral leaderboard: reward top advocates
- Check Stripe: ensure webhooks are healthy

## Launch Announcement Checklist
- [ ] Post on The Underground (voxunderground.substack.com)
- [ ] Share your referral link on social media
- [ ] Send a broadcast email to the waitlist via admin dashboard
- [ ] Monitor admin for first signups in real time
