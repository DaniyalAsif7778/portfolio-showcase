# Daniyal Asif Portfolio

A responsive portfolio for MERN Stack Developer Daniyal Asif. The interface uses a portrait-inspired teal and warm neutral palette, with light and dark themes, an animated project showcase, and a profiles page connected to GitHub and LinkedIn.

## Stack

- React 18, TypeScript, and Vite
- Tailwind CSS and shadcn/ui
- GSAP and ScrollTrigger for page and project reveals
- Supabase for portfolio content and admin data

## Run locally

Requires Node.js 20 or newer and npm.

```sh
npm install
npm run dev
```

Vite serves the development app at `http://localhost:8080`.

## Other commands

```sh
npm run build       # production build
npm run build:dev   # development-mode build
npm run lint        # ESLint
npm run preview     # preview the production build
```

## Content and configuration

Project, skill, and site profile content is read from Supabase. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for the frontend. The `/admin-panel` route is reserved for content administration. Keep service-role credentials out of browser code.

Copy `.env.example` to `.env` for local development and fill in the public Vite values. `.env` is ignored by Git. Every `VITE_` value is visible in the built browser app, so never put a database password, service-role key, or admin password in one.

## Rate limiting and deployment variables

The `admin-projects` Edge Function uses database-backed rate limits shared across function instances: 40 login attempts per IP per 15 minutes, 8 attempts per account per 15 minutes, 300 authenticated admin requests per 10 minutes, and 60 image uploads per hour. Rate-limit keys are HMACed with the admin session secret. Project table writes and project image writes are restricted to the service-role Edge Function.

Apply pending migrations to the same Supabase project configured by `VITE_SUPABASE_URL` with `npx supabase db push --linked`, then deploy the `admin-projects` function with `npx supabase functions deploy admin-projects`. Keep `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, and `ADMIN_SESSION_SECRET` in Supabase Edge Function secrets. Supabase provides the function API credentials; never add a secret or service-role key to Vercel's browser environment.

Project screenshots preserve their original dimensions and support PNG, JPG, WEBP, GIF, and AVIF files up to 20 MB each. Large images upload to a private staging bucket in resumable chunks. The authenticated Edge Function checks the file signature before copying validated bytes into the public `project-images` bucket. Both buckets require the Supabase project's global Storage file-size limit to allow at least 20 MB.

To reset the admin username and password on Windows, run `.\scripts\reset-admin-password.ps1` in PowerShell from the repository root. The script updates the password hash and session secret in the linked Supabase project. Updating the session secret also clears existing login rate-limit buckets and invalidates previous sessions.

In Vercel, open **Project Settings → Environment Variables** and add these for Production (and Preview/Development if you use those environments):

```text
VITE_SITE_URL=https://daniyal-porfolio-three.vercel.app
VITE_SUPABASE_URL=https://zoqinttgcnecepvzhsvj.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
```

Save the variables and redeploy so Vite rebuilds the client and sitemap with the configured values. Do not add the database connection string or password shown in Supabase's database connection panel to Vercel.

Apply pending database changes with `supabase db push` after linking the CLI to the Supabase project. This also refreshes the featured project records from the public GitHub repositories.

The resume PDF is served from `public/Daniyal_Asif_CV.pdf`. Set `VITE_SITE_URL` in the deployment environment to the public site origin; page canonical links and generated sitemap URLs use this setting.

## Search engine setup

Client-side page titles, descriptions, canonical links, social sharing tags, and route-specific structured data are managed by `src/components/SEO.tsx`. The initial HTML response contains the homepage metadata and the site-wide Person and WebSite entities. Other routes currently update metadata after JavaScript starts; build-time rendering for route-specific initial HTML remains a follow-up.

The default Open Graph and Twitter preview uses `public/portfolio-og.png`, a 1200 × 630 desktop capture of the portfolio. Project detail routes use their project image when available. The relevant keyword plan and its 20-phrase, two-device tracking scope are documented in `SEO_KEYWORD_PLAN.md`; phrases should appear only where they truthfully describe visible content.

`public/robots.txt` points crawlers to `public/sitemap.xml`. The production build writes a **static** `dist/robots.txt` and `dist/sitemap.xml` for the configured `VITE_SITE_URL`. It includes the homepage, profiles, contact, privacy, terms, and project detail pages. At build time, public project slugs are read from Supabase so new and removed projects are reflected in the generated sitemap; when Supabase is unavailable, the committed sitemap provides a fallback list of the original project pages. Admin edits are reflected in the sitemap after the next build. No sitemap is generated or served dynamically per request. The admin and not-found routes are excluded from the sitemap and marked `noindex`.

About, Skills, and the project showcase are homepage sections rather than separate indexable pages. Their fragment URLs are intentionally not listed in the sitemap. `/about`, `/skills`, and `/projects` redirect to those sections; `/github` redirects to `/profiles`.

The current production URL is `https://daniyal-porfolio-three.vercel.app`. Set `VITE_SITE_URL` to that URL in the deployment environment if it changes. After deploying, confirm that the homepage, `/robots.txt`, `/sitemap.xml`, and a project detail URL all load over HTTPS before submitting the sitemap to Google Search Console.

To request Google indexing:

1. Open [Google Search Console](https://search.google.com/search-console) and add the public domain as a URL-prefix property (or verify the domain with DNS).
2. Complete Google's ownership verification. The DNS method uses a TXT record at your domain provider; URL-prefix properties can also offer an HTML file or meta tag method.
3. Confirm `https://daniyal-porfolio-three.vercel.app/robots.txt` and `https://daniyal-porfolio-three.vercel.app/sitemap.xml` return HTTP 200 after deployment, then open **Sitemaps**, enter `sitemap.xml`, and submit it.
4. Use **URL inspection** on the homepage, profiles, contact, and selected project URLs. Check the rendered page and Google-selected canonical, then request indexing for important URLs.
5. Return to the Sitemaps and Pages reports to review fetch errors, discovered URLs, and indexing exclusions. Sitemap submission helps Google discover URLs; it cannot force crawling, indexing, or a ranking position. Google selects result titles and snippets and may take time to recrawl changes.

## Motion principles

The home and projects pages use GSAP with the `0.16, 1, 0.3, 1` ease, staggered entry timing, and ScrollTrigger reveals. Scroll animations respect `prefers-reduced-motion`. The motion reference for future work lives at `.claude/skills/motion-principles/SKILL.md`.
