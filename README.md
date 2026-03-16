# Newsroom — Vercel Deployment

## Project Structure
```
newsroom/
├── api/
│   └── send.js        # Resend email proxy (handles CORS)
├── public/
│   └── index.html     # Landing page placeholder
└── vercel.json        # Vercel config
```

## Environment Variables (set in Vercel dashboard)
| Variable | Value |
|----------|-------|
| `RESEND_API_KEY` | Your Resend API key (re_xxxx...) |
| `FROM_EMAIL` | Your sending address (e.g. onboarding@resend.dev) |

## API Endpoint
`POST /api/send`

Body:
```json
{
  "to": "recipient@email.com",
  "subject": "Your morning briefing",
  "html": "<html>...</html>",
  "from": "optional@override.com"
}
```

## Deploy Steps
1. Push this folder to a GitHub repo
2. Import repo in Vercel dashboard
3. Add environment variables in Vercel → Settings → Environment Variables
4. Deploy — done
