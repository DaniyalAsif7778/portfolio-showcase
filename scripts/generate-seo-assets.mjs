import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { loadEnv } from 'vite';

const env = { ...loadEnv('production', process.cwd(), ''), ...process.env };
const configuredSiteUrl = (env.VITE_SITE_URL || 'https://daniyal-porfolio-three.vercel.app').trim();
const site = new URL(configuredSiteUrl);
if (site.protocol !== 'https:' && site.hostname !== 'localhost') {
  throw new Error('VITE_SITE_URL must use HTTPS for the public portfolio domain.');
}
const base = site.href.replace(/\/$/, '');
const outDir = path.resolve(process.cwd(), 'dist');

const staticPaths = ['/', '/profiles', '/contact', '/privacy', '/terms'];
const staticPages = {
  '/profiles': {
    title: 'Developer Profiles | Daniyal Asif',
    description: 'Find Daniyal Asif on GitHub and LinkedIn. Browse recent repositories, open-source work, and professional profile details.',
    heading: 'Developer Profiles',
    body: 'Explore Daniyal Asif’s code on GitHub and connect on LinkedIn.',
    links: [['GitHub', 'https://github.com/DaniyalAsif7778'], ['LinkedIn', 'https://www.linkedin.com/in/daniyal-asif-25ba10332/']],
  },
  '/contact': {
    title: 'Contact Daniyal Asif',
    description: 'Get in touch with Daniyal Asif about MERN stack development, frontend opportunities, collaborations, and web application projects.',
    heading: 'Contact Daniyal Asif',
    body: 'Reach out about MERN stack development, collaborations, or a web application project.',
    links: [['Email Daniyal', 'mailto:danyalasif.dev@gmail.com']],
  },
  '/privacy': {
    title: 'Privacy Policy | Daniyal Asif',
    description: 'Privacy information for Daniyal Asif’s portfolio website, contact form messages, and visitor data.',
    heading: 'Privacy Policy',
    body: 'This portfolio is maintained by Daniyal Asif, a MERN Stack Developer based in Islamabad, Pakistan. Contact form details are used to respond to your message.',
    links: [],
  },
  '/terms': {
    title: 'Terms and Conditions | Daniyal Asif',
    description: 'Terms for using Daniyal Asif’s portfolio website, viewing project work, and sending a contact message.',
    heading: 'Terms and Conditions',
    body: 'Project descriptions and media are provided to present Daniyal Asif’s work. External project links are managed by their respective owners.',
    links: [],
  },
};
const sourceSitemap = await readFile(path.resolve(process.cwd(), 'public/sitemap.xml'), 'utf8');
const fallbackProjectPaths = [...sourceSitemap.matchAll(/<loc>https?:\/\/[^<]+\/projects\/([a-z0-9-]+)<\/loc>/g)]
  .map(([, slug]) => `/projects/${slug}`);
let projects = [];
let projectLookupSucceeded = false;
let profile = {};
let skills = [];
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;

const fallbackSkills = [
  ['React.js', 'Frontend'], ['JavaScript (ES6+)', 'Frontend'], ['TypeScript', 'Frontend'],
  ['HTML5', 'Frontend'], ['CSS3', 'Frontend'], ['Tailwind CSS', 'Frontend'], ['Responsive design', 'Frontend'],
  ['Node.js', 'Backend'], ['Express.js', 'Backend'], ['REST APIs', 'Backend'],
  ['MongoDB', 'Database'], ['Mongoose', 'Database'], ['React Router', 'Routing'],
  ['TanStack Router', 'Routing'], ['GSAP', 'Animation'], ['Redux Toolkit', 'State Management'],
].map(([name, category]) => ({ name, category }));

if (supabaseUrl && supabaseKey) {
  try {
    const endpoint = new URL('/rest/v1/projects', supabaseUrl);
    endpoint.searchParams.set('select', 'slug,title,description,detailed_description,tech_stack,images,github_url,live_url,updated_at');
    endpoint.searchParams.set('order', 'created_at.desc');
    const response = await fetch(endpoint, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`Supabase returned HTTP ${response.status}`);
    const rows = await response.json();
    projects = rows
      .filter((project) => typeof project.slug === 'string' && /^[a-z0-9-]+$/.test(project.slug))
      .map((project) => ({ ...project, updatedAt: project.updated_at }));
    projectLookupSucceeded = true;
  } catch (error) {
    console.warn(`Sitemap will use its committed project URL fallback because Supabase project lookup failed: ${error.message}`);
  }

  const readPublicTable = async (table, select) => {
    const endpoint = new URL(`/rest/v1/${table}`, supabaseUrl);
    endpoint.searchParams.set('select', select);
    const response = await fetch(endpoint, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`Supabase ${table} returned HTTP ${response.status}`);
    return response.json();
  };
  try {
    const rows = await readPublicTable('skills', 'name,category,featured,sort_order');
    if (Array.isArray(rows) && rows.length) skills = rows;
  } catch (error) {
    console.warn(`Homepage static skills will use resume fallback data: ${error.message}`);
  }
  try {
    const rows = await readPublicTable('site_settings', 'name,badge,tagline,intro');
    if (Array.isArray(rows) && rows[0]) profile = rows[0];
  } catch (error) {
    console.warn(`Homepage static intro will use fallback copy: ${error.message}`);
  }
} else {
  console.warn('Supabase environment values are missing; sitemap will use the committed project URL fallback.');
}
if (!skills.length) skills = fallbackSkills;

const escapeXml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
const escapeHtml = (value) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const safeJson = (value) => JSON.stringify(value).replaceAll('<', '\\u003c').replaceAll('>', '\\u003e').replaceAll('&', '\\u0026');
const setMeta = (html, attribute, key, content) => {
  const expression = new RegExp(`<meta\\b(?=[^>]*\\b${attribute}=["']${key}["'])[^>]*>`, 'i');
  const tag = `<meta ${attribute}="${escapeHtml(key)}" content="${escapeHtml(content)}" />`;
  return expression.test(html) ? html.replace(expression, tag) : html.replace('</head>', `  ${tag}\n  </head>`);
};
const removeMeta = (html, attribute, key) => {
  const expression = new RegExp(`<meta\\b(?=[^>]*\\b${attribute}=["']${key}["'])[^>]*>`, 'i');
  return html.replace(expression, '');
};
const makeCanonical = (html, url) => {
  const tag = `<link rel="canonical" href="${escapeHtml(url)}" />`;
  const expression = /<link[^>]*rel=["']canonical["'][^>]*>/i;
  return expression.test(html) ? html.replace(expression, tag) : html.replace('</head>', `  ${tag}\n  </head>`);
};
const projectImage = (project) => {
  const candidate = Array.isArray(project.images) ? project.images[0] : null;
  if (!candidate) return `${base}/portfolio-og.png`;
  try {
    const url = new URL(candidate, `${base}/`);
    return url.protocol === 'https:' || url.hostname === 'localhost' ? url.href : `${base}/portfolio-og.png`;
  } catch {
    return `${base}/portfolio-og.png`;
  }
};
const staticRootStyle = 'max-width:1120px;margin:0 auto;padding:clamp(96px,16vh,160px) 24px 72px;font-family:Arial,sans-serif;color:#f3f3f0;background:#0c1b1d;min-height:100vh;box-sizing:border-box';
const staticLink = (label, href) => `<a href="${escapeHtml(href)}" style="display:inline-flex;margin:16px 12px 0 0;padding:12px 18px;border:1px solid #45605e;border-radius:999px;color:#60cec3;text-decoration:none">${escapeHtml(label)}</a>`;
const safeHref = (value) => {
  try {
    const url = new URL(value, `${base}/`);
    return ['https:', 'http:', 'mailto:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};
const writeRouteHtml = async (route, metadata, content, routeData = null) => {
  const canonicalUrl = `${base}${route}`;
  const imageUrl = metadata.image || `${base}/portfolio-og.png`;
  let html = (await readFile(path.join(outDir, 'index.html'), 'utf8')).replaceAll('https://daniyal-porfolio-three.vercel.app', base);
  html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(metadata.title)}</title>`);
  html = setMeta(html, 'name', 'description', metadata.description);
  html = setMeta(html, 'property', 'og:site_name', 'Daniyal Asif | MERN Stack Developer');
  html = setMeta(html, 'property', 'og:title', metadata.title);
  html = setMeta(html, 'property', 'og:description', metadata.description);
  html = setMeta(html, 'property', 'og:type', 'website');
  html = setMeta(html, 'property', 'og:url', canonicalUrl);
  html = setMeta(html, 'property', 'og:image', imageUrl);
  html = setMeta(html, 'property', 'og:image:alt', metadata.image ? `${metadata.heading} project screenshot` : 'Desktop preview of Daniyal Asif’s MERN Stack Developer portfolio');
  html = setMeta(html, 'name', 'twitter:card', 'summary_large_image');
  html = setMeta(html, 'name', 'twitter:title', metadata.title);
  html = setMeta(html, 'name', 'twitter:description', metadata.description);
  html = setMeta(html, 'name', 'twitter:image', imageUrl);
  html = setMeta(html, 'name', 'twitter:image:alt', metadata.image ? `${metadata.heading} project screenshot` : 'Desktop preview of Daniyal Asif’s MERN Stack Developer portfolio');
  if (routeData) {
    html = removeMeta(html, 'property', 'og:image:width');
    html = removeMeta(html, 'property', 'og:image:height');
  }
  html = makeCanonical(html, canonicalUrl);

  if (routeData) {
    const script = `<script id="portfolio-page-jsonld" type="application/ld+json">${safeJson({
      '@context': 'https://schema.org',
      '@graph': [{
        '@type': 'CreativeWork',
        name: routeData.title,
        description: routeData.description,
        url: canonicalUrl,
        image: imageUrl,
        author: { '@type': 'Person', '@id': `${base}/#person`, name: 'Daniyal Asif' },
        keywords: Array.isArray(routeData.tech_stack) ? routeData.tech_stack.join(', ') : undefined,
        dateModified: routeData.updatedAt || undefined,
      }],
    })}</script>`;
    html = html.replace('</head>', `  ${script}\n  </head>`);
  }

  html = html.replace('<div id="root"></div>', `<div id="root">${content}</div>`);
  const routeFile = path.join(outDir, `${route.replace(/^\//, '')}.html`);
  await mkdir(path.dirname(routeFile), { recursive: true });
  await writeFile(routeFile, html, 'utf8');
};

for (const [route, page] of Object.entries(staticPages)) {
  const links = page.links.map(([label, href]) => {
    const safe = safeHref(href);
    return safe ? staticLink(label, safe) : '';
  }).join('');
  const content = `<main id="seo-static-content" style="${staticRootStyle}"><p style="letter-spacing:.2em;text-transform:uppercase;color:#60cec3">Daniyal Asif · MERN Stack Developer</p><h1 style="font-size:clamp(40px,8vw,96px);line-height:1.04;margin:22px 0">${escapeHtml(page.heading)}</h1><p style="font-size:18px;line-height:1.7;max-width:680px;color:#c2cfcd">${escapeHtml(page.body)}</p>${links}</main>`;
  await writeRouteHtml(route, page, content);
}

const projectRows = projectLookupSucceeded
  ? projects
  : fallbackProjectPaths.map((route) => {
      const slug = route.split('/').at(-1) || 'project';
      const title = slug.split('-').map((word) => word[0]?.toUpperCase() + word.slice(1)).join(' ');
      return { slug, title, description: 'Explore this project in Daniyal Asif’s portfolio.', tech_stack: [], images: [], updatedAt: null };
    });
for (const project of projectRows) {
  const route = `/projects/${project.slug}`;
  const title = escapeHtml(project.title || project.slug);
  const description = escapeHtml(project.description || 'Project work by Daniyal Asif.');
  const details = escapeHtml(project.detailed_description || '');
  const image = projectImage(project);
  const stack = Array.isArray(project.tech_stack) ? project.tech_stack : [];
  const stackMarkup = stack.length ? `<ul style="display:flex;flex-wrap:wrap;gap:10px;list-style:none;padding:0">${stack.map((item) => `<li style="border:1px solid #45605e;border-radius:999px;padding:8px 12px">${escapeHtml(item)}</li>`).join('')}</ul>` : '';
  const screenshot = Array.isArray(project.images) && project.images[0]
    ? `<img src="${escapeHtml(image)}" alt="${title} project screenshot" style="display:block;width:min(100%,1000px);height:auto;max-height:70vh;object-fit:contain;margin:36px auto" />`
    : '';
  const links = [project.live_url && safeHref(project.live_url) && staticLink('Live project', safeHref(project.live_url)), project.github_url && safeHref(project.github_url) && staticLink('Source code', safeHref(project.github_url))].filter(Boolean).join('');
  const content = `<main id="seo-static-content" style="${staticRootStyle}"><a href="/#projects" style="color:#60cec3">← Selected work</a><p style="letter-spacing:.2em;text-transform:uppercase;color:#60cec3;margin-top:42px">Project</p><h1 style="font-size:clamp(40px,8vw,96px);line-height:1.04;margin:18px 0">${title}</h1><p style="font-size:20px;line-height:1.7;max-width:760px;color:#c2cfcd">${description}</p>${stackMarkup}${screenshot}${details ? `<p style="font-size:17px;line-height:1.8;max-width:800px;color:#c2cfcd">${details}</p>` : ''}${links}</main>`;
  await writeRouteHtml(route, {
    title: `${project.title || project.slug} | Daniyal Asif`,
    heading: project.title || project.slug,
    description: project.description || 'Project work by Daniyal Asif.',
    image,
  }, content, project);
}
const formatLastmod = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : `<lastmod>${date.toISOString()}</lastmod>`;
};
const dynamicProjectEntries = projectRows.map(({ slug, updatedAt }) => ({ loc: `${base}/projects/${slug}`, updatedAt }));
const entries = [
  ...staticPaths.map((route) => ({ loc: `${base}${route}`, updatedAt: null })),
  ...dynamicProjectEntries,
].filter((entry, index, all) => all.findIndex(({ loc }) => loc === entry.loc) === index);
const urls = entries.map(({ loc, updatedAt }) => `  <url><loc>${escapeXml(loc)}</loc>${formatLastmod(updatedAt)}</url>`).join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
const robots = `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`;

await mkdir(outDir, { recursive: true });
const htmlPath = path.join(outDir, 'index.html');
let html = (await readFile(htmlPath, 'utf8')).replaceAll('https://daniyal-porfolio-three.vercel.app', base);
html = makeCanonical(html, `${base}/`);
const homepageSkillSet = skills.some((skill) => skill.featured) ? skills.filter((skill) => skill.featured) : skills;
const skillGroups = [...new Set(homepageSkillSet.map((skill) => skill.category || 'Other'))];
const skillsMarkup = skillGroups.map((category) => {
  const names = homepageSkillSet.filter((skill) => (skill.category || 'Other') === category).map((skill) => escapeHtml(skill.name));
  return `<section style="margin-top:22px"><h3 style="font-size:18px;color:#edf5f1">${escapeHtml(category)}</h3><ul style="display:flex;flex-wrap:wrap;gap:8px;list-style:none;padding:0">${names.map((name) => `<li style="border:1px solid #45605e;border-radius:999px;padding:7px 10px;color:#c2cfcd">${name}</li>`).join('')}</ul></section>`;
}).join('');
const projectPreview = projectRows.slice(0, 3).map((project) => `<article style="border:1px solid #314648;border-radius:16px;padding:20px;margin-top:14px"><h3 style="font-size:21px;margin:0 0 8px"><a href="/projects/${escapeHtml(project.slug)}" style="color:#60cec3">${escapeHtml(project.title || project.slug)}</a></h3><p style="color:#c2cfcd;line-height:1.65;margin:0">${escapeHtml(project.description || 'Project work by Daniyal Asif.')}</p></article>`).join('');
const homepageName = escapeHtml(profile.name || 'Daniyal Asif');
const homepageBadge = escapeHtml(profile.badge || 'MERN Stack Developer · Islamabad, Pakistan');
const homepageIntro = escapeHtml(profile.intro || 'I build full stack web applications with MongoDB, Express.js, React, and Node.js. Explore selected projects, technical skills, and ways to get in touch.');
const homepageTagline = escapeHtml(profile.tagline || 'Building useful web apps.');
const homepageShell = `<main id="seo-static-content" style="${staticRootStyle}"><img src="/daniyal-profile.png" width="320" height="320" alt="Portrait of ${homepageName}, MERN Stack Developer" style="display:block;width:min(42vw,320px);height:auto;border-radius:50%;margin-bottom:32px" /><p style="letter-spacing:.2em;text-transform:uppercase;color:#60cec3">${homepageBadge}</p><h1 style="font-size:clamp(40px,8vw,96px);line-height:1.04;margin:22px 0">${homepageName}: ${homepageTagline}</h1><p style="font-size:18px;line-height:1.7;max-width:760px;color:#c2cfcd">${homepageIntro}</p><a href="/#projects" style="display:inline-flex;margin:16px 12px 0 0;padding:12px 18px;border:1px solid #45605e;border-radius:999px;color:#60cec3;text-decoration:none">Explore selected projects</a><section style="margin-top:48px"><h2 style="font-size:30px">Technical skills</h2>${skillsMarkup}</section><section style="margin-top:48px"><h2 style="font-size:30px">Selected projects</h2>${projectPreview}</section><p style="margin-top:38px;color:#c2cfcd">Based in Islamabad, Pakistan · <a href="/contact" style="color:#60cec3">Contact ${homepageName}</a></p></main>`;
html = html.replace('<div id="root"></div>', `<div id="root">${homepageShell}</div>`);
await writeFile(htmlPath, html, 'utf8');
await Promise.all([
  writeFile(path.join(outDir, 'sitemap.xml'), sitemap, 'utf8'),
  writeFile(path.join(outDir, 'robots.txt'), robots, 'utf8'),
]);
console.log(`Generated robots.txt and sitemap.xml for ${site.origin} (${entries.length} URLs, ${dynamicProjectEntries.length} project pages${projectLookupSucceeded ? '' : ', using committed fallback'}).`);
