# Ottie Luxe

Phase 2 is a mobile-first Next.js catalogue with shareable product pages, a persistent WhatsApp basket and a secure Supabase-backed owner studio.

## Local preview

1. Use Node.js 22 or newer.
2. Install packages with `npm install`.
3. Copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000` while developing locally.
4. Run `npm run dev` and open `http://localhost:3000`.

The storefront also fails gracefully without Supabase by using the seed catalogue in `lib/seed-data.ts`. Clear the two Supabase values only when intentionally testing that fallback.

## Enable the owner studio

1. Create a Supabase project and apply every SQL file in `supabase/migrations` in filename order.
2. Run `supabase/seed.sql` in the SQL editor.
3. Create the single owner under Supabase Authentication with email/password signup disabled for the public.
4. Insert the owner Auth UUID into `public.admin_profiles` using the commented statement at the bottom of `supabase/seed.sql`.
5. Create `.env.local` from `.env.example` and add the project URL and publishable key.
6. In Supabase Auth URL settings, add the local URL and the Vercel preview/production URLs as permitted redirects.

Row Level Security allows public reads only for published catalogue records. All catalogue, promotion and storage writes require the active owner profile.

## Analytics

Create an Umami Cloud website and set `NEXT_PUBLIC_UMAMI_WEBSITE_ID`. Leave it blank to disable analytics. No personal order details are sent to analytics.

## Verification

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npx playwright install chromium firefox webkit`
- `npm run test:e2e`
- `supabase test db` (after starting the local Supabase stack)

## Release flow

The current production deployment is [ottie-luxe.vercel.app](https://ottie-luxe.vercel.app). Connect this repository to that Vercel project for automatic releases: `dev` is for previews and `main` is production. Configure the environment values separately for preview and production, validate the preview, then promote the same tested deployment.
