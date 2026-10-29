import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { loadEnv } from 'vite';

const env = { ...loadEnv('production', process.cwd(), ''), ...process.env };
const configuredSiteUrl = (env.VITE_SITE_URL || 'https://portfolio-showcase-rho.vercel.app').trim();
const site = new URL(configuredSiteUrl);
if (site.protocol !== 'https:' && site.hostname !== 'localhost') {
  throw new Error('VITE_SITE_URL must use HTTPS for the public portfolio domain.');
}
const base = site.href.replace(/\/$/, '');
const outDir = path.resolve(process.cwd(), 'dist');

const staticPaths = ['/', '/profiles', '/contact', '/privacy', '/terms'];
let projects = [];
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey) {
  try {
    const endpoint = new URL('/rest/v1/projects?select=slug,updated_at&order=created_at.desc', supabaseUrl);
    const response = await fetch(endpoint, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`Supabase returned HTTP ${response.status}`);
    const rows = await response.json();
    projects = rows
      .filter((project) => typeof project.slug === 'string' && /^[a-z0-9-]+$/.test(project.slug))
      .map((project) => ({ slug: project.slug, updatedAt: project.updated_at }));
  } catch (error) {
    console.warn(`SEO sitemap could not load project slugs from Supabase: ${error.message}`);
  }
} else {
  console.warn('Supabase environment values are missing; project detail pages will not be included in the sitemap.');
}

const escapeXml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
const entries = [
  ...staticPaths.map((route) => ({ loc: `${base}${route}`, updatedAt: null })),
  ...projects.map(({ slug, updatedAt }) => ({ loc: `${base}/projects/${slug}`, updatedAt })),
];
const urls = entries.map(({ loc, updatedAt }) => `  <url><loc>${escapeXml(loc)}</loc>${updatedAt ? `<lastmod>${escapeXml(new Date(updatedAt).toISOString())}</lastmod>` : ''}</url>`).join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
const robots = `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`;

await mkdir(outDir, { recursive: true });
const htmlPath = path.join(outDir, 'index.html');
const html = await readFile(htmlPath, 'utf8');
await writeFile(htmlPath, html.replaceAll('https://portfolio-showcase-rho.vercel.app', base), 'utf8');
await Promise.all([
  writeFile(path.join(outDir, 'sitemap.xml'), sitemap, 'utf8'),
  writeFile(path.join(outDir, 'robots.txt'), robots, 'utf8'),
]);
console.log(`Generated robots.txt and sitemap.xml for ${site.origin} (${entries.length} URLs, ${projects.length} projects).`);
