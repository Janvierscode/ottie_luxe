# Ottie Luxe

[Live demo → https://ottie-luxe.vercel.app/](https://ottie-luxe.vercel.app/)

![Homepage screenshot](public/homepage.png)

## Summary

Ottie Luxe is a polished, responsive storefront built with modern web tooling and focused on accessibility, performance and a smooth owner studio experience powered by Supabase.

## Tech & tools used

- **Language & Frameworks:** TypeScript, React, Next.js
- **Styling & UI:** (project uses global CSS; design assets included in `public`)
- **API / Backend-as-a-Service:** Supabase (auth, storage, row-level security)
- **Data validation:** Zod
- **Icons:** lucide-react
- **Testing:** Playwright (E2E), Node test runner (unit)
- **Accessibility:** @axe-core/playwright checks in CI
- **Linting & Types:** ESLint, TypeScript
- **Deployment:** Vercel
- **Analytics (optional):** Umami

## Skills & disciplines demonstrated

- Building production-ready Next.js apps with TypeScript
- Integrating third-party BaaS (Supabase) and designing secure RLS policies
- E2E and accessibility testing with Playwright and axe
- Responsive, mobile-first design and UI implementation
- API design, data validation and type-safe patterns with Zod
- CI-friendly scripts and developer ergonomics (linting, typecheck)

## Local development

Prerequisites: Node.js 22 or newer

1. Install dependencies:

   npm install

2. Copy environment example and set local URL:

   cp .env.example .env.local

   # set NEXT_PUBLIC_SITE_URL=http://localhost:3000

3. Run the dev server:

   npm run dev

Open http://localhost:3000 to preview the storefront.

The storefront falls back to the seed catalogue in `lib/seed-data.ts` when Supabase is not configured.

## Owner studio (Supabase) setup

1. Create a Supabase project and apply SQL migrations from `supabase/migrations` in filename order.
2. Run `supabase/seed.sql` in the SQL editor.
3. Create the owner account in Supabase Auth (email/password signup disabled for the public).
4. Insert the owner Auth UUID into `public.admin_profiles` (see commented SQL in `supabase/seed.sql`).
5. Add the Supabase URL and key to `.env.local`.

## Scripts and verification

- `npm run dev` — development server
- `npm run build` — production build
- `npm start` — run built app
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript checks
- `npm test` — unit tests
- `npm run test:e2e` — build + Playwright E2E tests

Recommended local checks:

- `npx playwright install chromium firefox webkit`
- `npm run lint`
- `npm run typecheck`
- `npm test`

## Deployment

Deploy to Vercel (the project is already hosted at the URL above). Use the `dev` branch for previews and `main` for production deployments.

## Notes

- Place a screenshot at `public/homepage.png` to render in this README.
- The project intentionally degrades gracefully if Supabase is not configured by using `lib/seed-data.ts`.

If you'd like, I can also add a small CONTRIBUTING section, set up a GitHub Actions workflow, or commit a recommended `public/homepage.png` placeholder image.
