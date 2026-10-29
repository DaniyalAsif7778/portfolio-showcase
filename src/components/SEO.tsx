import { useEffect } from 'react';

type SEOProps = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
};

const SITE_NAME = 'Daniyal Asif | MERN Stack Developer';
const PROFILE_IMAGE = '/daniyal-profile.png';
const DEFAULT_SITE_URL = 'https://portfolio-showcase-rho.vercel.app';

function upsertMeta(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

const SEO = ({ title, description, path, image = PROFILE_IMAGE, noIndex = false, structuredData }: SEOProps) => {
  useEffect(() => {
    const configuredOrigin = import.meta.env.VITE_SITE_URL?.trim() || DEFAULT_SITE_URL;
    const origin = (configuredOrigin || window.location.origin).replace(/\/$/, '');
    const canonicalUrl = new URL(path || window.location.pathname, `${origin}/`).toString();
    const imageUrl = new URL(image, `${origin}/`).toString();
    const pageTitle = title.includes('Daniyal Asif') ? title : `${title} | Daniyal Asif`;

    document.title = pageTitle;
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    upsertMeta('meta[name="description"]', 'name', 'description', description);
    upsertMeta('meta[name="robots"]', 'name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', pageTitle);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
    upsertMeta('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME);
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    upsertMeta('meta[property="og:image"]', 'property', 'og:image', imageUrl);
    upsertMeta('meta[property="og:image:alt"]', 'property', 'og:image:alt', 'Portrait of Daniyal Asif, MERN Stack Developer');
    upsertMeta('meta[property="og:image:width"]', 'property', 'og:image:width', '800');
    upsertMeta('meta[property="og:image:height"]', 'property', 'og:image:height', '800');
    upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', pageTitle);
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);
    upsertMeta('meta[name="twitter:image:alt"]', 'name', 'twitter:image:alt', 'Portrait of Daniyal Asif, MERN Stack Developer');

    let jsonLd = document.head.querySelector<HTMLScriptElement>('#portfolio-page-jsonld');
    if (!jsonLd) {
      jsonLd = document.createElement('script');
      jsonLd.id = 'portfolio-page-jsonld';
      jsonLd.type = 'application/ld+json';
      document.head.appendChild(jsonLd);
    }
    const graph = structuredData
      ? (Array.isArray(structuredData) ? structuredData : [structuredData])
      : [];
    jsonLd.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          name: SITE_NAME,
          url: `${origin}/`,
          inLanguage: 'en',
        },
        ...graph,
      ],
    });
  }, [description, image, noIndex, path, structuredData, title]);

  return null;
};

export default SEO;
