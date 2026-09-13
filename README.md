# Grandma's Lunchbox

A mobile-first Next.js MVP for home-cooked lunch subscriptions serving selected ITPL and nearby offices in Whitefield, Bengaluru.

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown by Next.js. The `/admin` dashboard requires an admin login.

## Development payment mode

Razorpay is not configured by default. Checkout clearly marks the gateway as unavailable and provides a development-only simulation link. A future implementation should create a Razorpay order server-side, verify the signature, process webhooks, and activate the subscription only after verification.

## Project map

- `app/page.tsx` — customer homepage
- `app/order`, `app/checkout`, `app/success` — order flow
- `app/admin` — operations dashboard
- `app/globals.css` — brand tokens and responsive UI
- `.env.example` — required deployment environment variables

Mock data and service abstractions can be added under `data/` and `lib/services/` as the PostgreSQL implementation is introduced. Keep payment secrets server-only.
