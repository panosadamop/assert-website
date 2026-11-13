import type { Metadata } from 'next';
import type { BreadcrumbList, Graph, Organization, Thing, WebSite } from 'schema-dts';
import { siteUrl } from './cms';
import { getI18n } from './i18n';
import type { Seo, Settings } from './types';

interface PageMetaInput {
  /** Visible page title, used when no SEO title is set. */
  title?: string;
  description?: string;
  /** Path of the page, e.g. "/products/lawflow". */
  path: string;
  seo?: Seo;
  /** Small label shown on the auto-generated social image. */
  kicker?: string;
  type?: 'website' | 'article';
  /** Home page uses the default title without the template. */
  isHome?: boolean;
}

/** Builds complete Next.js metadata (title, description, canonical, Open Graph, Twitter, robots). */
export async function pageMetadata(input: PageMetaInput): Promise<Metadata> {
  const { site, prefix, locale } = await getI18n();
  const { settings, i18n } = site;
  const base = await siteUrl();
  const s = settings.seo || {};
  const seo = input.seo || {};
  const siteName = settings.siteName || 'ASSERT';

  const rawTitle = seo.title || input.title || s.defaultTitle || siteName;
  const title = input.isHome ? seo.title || s.defaultTitle || rawTitle : rawTitle;
  const description = seo.description || input.description || s.defaultDescription || settings.tagline || '';
  const at = (pre: string) => `${base}${pre}${input.path === '/' ? '' : input.path}` || base;
  const canonical = seo.canonical || at(prefix);
  // hreflang alternates: the same page in every enabled language (slugs are shared).
  const languages: Record<string, string> = {};
  if (i18n.languages.length > 1) {
    for (const l of i18n.languages) languages[l.code] = at(l.code === i18n.defaultLang ? '' : `/${l.code}`);
    languages['x-default'] = at('');
  }

  const ogImage = absolute(base, seo.ogImage || s.defaultOgImage) ||
    `${base}/og?${new URLSearchParams({ title: input.isHome ? (settings.tagline || title) : (input.title || title), kicker: input.kicker || siteName }).toString()}`;

  const index = s.allowIndexing !== false && !seo.noindex;
  const keywords = [...(seo.keywords || []), ...(s.keywords || [])];

  return {
    title: input.isHome ? { absolute: title } : title,
    description,
    keywords: keywords.length ? Array.from(new Set(keywords)) : undefined,
    alternates: { canonical, languages: Object.keys(languages).length ? languages : undefined },
    robots: index
      ? { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } }
      : { index: false, follow: false },
    openGraph: {
      type: input.type || 'website',
      url: canonical,
      siteName,
      title: input.isHome ? title : templated(s.titleTemplate, title),
      description,
      locale,
      alternateLocale: i18n.languages.filter((l) => l.locale && l.locale !== locale).map((l) => l.locale as string),
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: input.isHome ? title : templated(s.titleTemplate, title),
      description,
      images: [ogImage],
      site: s.twitterHandle || undefined,
      creator: s.twitterHandle || undefined,
    },
  };
}

function templated(template: string | undefined, title: string) {
  return template && template.includes('%s') ? template.replace('%s', title) : title;
}

export function absolute(base: string, url?: string): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}

/* ---------------------------- JSON-LD ---------------------------- */

export function organizationLd(settings: Settings, base: string): Organization {
  const c = settings.contact || {};
  const sameAs = (settings.socialLinks || []).map((l) => l.url).filter((u): u is string => !!u && /^https?:\/\//.test(u));
  return {
    '@type': 'Organization',
    '@id': `${base}/#organization`,
    name: settings.siteName || 'ASSERT',
    legalName: settings.organization?.legalName || undefined,
    url: base,
    logo: absolute(base, settings.logoDark || '/logo-dark.png'),
    description: settings.organization?.description || settings.seo?.defaultDescription || undefined,
    foundingDate: settings.organization?.foundingYear || undefined,
    vatID: settings.organization?.vatId || undefined,
    email: c.email || undefined,
    telephone: c.phone || undefined,
    address: c.city || c.street
      ? { '@type': 'PostalAddress', streetAddress: c.street || undefined, addressLocality: c.city || undefined, postalCode: c.postalCode || undefined, addressCountry: c.country || undefined }
      : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
    contactPoint: c.email || c.phone
      ? { '@type': 'ContactPoint', contactType: 'sales', email: c.email || undefined, telephone: c.phone || undefined, areaServed: ['GR', 'EU'], availableLanguage: ['en', 'el'] }
      : undefined,
  };
}

export function websiteLd(settings: Settings, base: string, lang?: string): WebSite {
  return {
    '@type': 'WebSite',
    '@id': `${base}/#website`,
    url: base,
    name: settings.siteName || 'ASSERT',
    description: settings.seo?.defaultDescription || undefined,
    inLanguage: lang || (settings.seo?.locale || 'en_US').replace('_', '-'),
    publisher: { '@id': `${base}/#organization` },
  };
}

export function breadcrumbLd(base: string, items: { name: string; path: string }[]): BreadcrumbList {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${base}${it.path === '/' ? '' : it.path}` })),
  };
}

/** Combines several schema.org nodes into one JSON-LD document. */
export function graph(...nodes: (Thing | Record<string, unknown> | undefined | false)[]): Graph {
  return { '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) as Thing[] } as Graph;
}
