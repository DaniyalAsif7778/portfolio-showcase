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

Page titles, descriptions, canonical links, social sharing tags, and structured data are managed by `src/components/SEO.tsx`. The production build creates `dist/robots.txt` and `dist/sitemap.xml`; it reads public project slugs from Supabase so project detail URLs are included automatically. The admin route has a `noindex` response header and client meta tag and is excluded from the sitemap.

The current production URL is `https://daniyal-porfolio-three.vercel.app`. Set `VITE_SITE_URL` to that URL in the deployment environment if it changes. After deploying, confirm that the homepage, `/robots.txt`, `/sitemap.xml`, and a project detail URL all load over HTTPS before submitting the sitemap to Google Search Console.

To request Google indexing:

1. Open [Google Search Console](https://search.google.com/search-console) and add the public domain as a URL-prefix property (or verify the domain with DNS).
2. Complete Google's ownership verification. The DNS method uses a TXT record at your domain provider; URL-prefix properties can also offer an HTML file or meta tag method.
3. In Search Console, open **Sitemaps**, enter `sitemap.xml`, and submit it.
4. Use **URL inspection** for the homepage and important project pages, then select **Request indexing**.
5. Return later to check indexing and any crawl or page experience issues. Google controls when pages are crawled and indexed, so submission is a request rather than a guarantee.

## Motion principles

The home and projects pages use GSAP with the `0.16, 1, 0.3, 1` ease, staggered entry timing, and ScrollTrigger reveals. Scroll animations respect `prefers-reduced-motion`. The motion reference for future work lives at `.claude/skills/motion-principles/SKILL.md`.
