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

Apply pending database changes with `supabase db push` after linking the CLI to the Supabase project. This also refreshes the featured project records from the public GitHub repositories.

The resume PDF is served from `public/Daniyal_Asif_CV.pdf`. Update the canonical and social metadata in `index.html` when the production domain is established.

## Motion principles

The home and projects pages use GSAP with the `0.16, 1, 0.3, 1` ease, staggered entry timing, and ScrollTrigger reveals. Scroll animations respect `prefers-reduced-motion`. The motion reference for future work lives at `.claude/skills/motion-principles/SKILL.md`.
