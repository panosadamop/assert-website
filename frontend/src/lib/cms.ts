import 'server-only';
import { cache } from 'react';
import type { About, ContactPage, Home, Page, Product, Sector, Site, SitemapEntry } from './types';

export const API_URL = (process.env.API_URL || 'http://localhost:4000').replace(/\/$/, '');
const REVALIDATE = Number(process.env.CMS_REVALIDATE_SECONDS || 300);
const isBuild = process.env.NEXT_PHASE === 'phase-production-build';

export class CmsUnavailableError extends Error {}

/**
 * Reads from the CMS public API. Responses are cached (ISR) and refreshed every
 * CMS_REVALIDATE_SECONDS or immediately when the CMS calls /api/revalidate.
 * - 404 → returns null (page shows "not found").
 * - CMS unreachable at runtime → throws, so Next.js keeps serving the last good page.
 * - CMS unreachable during `next build` → returns null so the build still succeeds;
 *   pages are refreshed automatically once the CMS is up.
 */
async function get<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}/api/public${path}`, {
      next: { revalidate: REVALIDATE, tags: ['cms'] },
      signal: AbortSignal.timeout(10_000),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`CMS responded ${res.status} for ${path}`);
    return (await res.json()) as T;
  } catch (err) {
    if (isBuild) {
      console.warn(`[cms] ${path}: ${(err as Error).message} – continuing build with empty content.`);
      return null;
    }
    throw new CmsUnavailableError(`CMS unavailable (${API_URL}): ${(err as Error).message}`);
  }
}

const EMPTY_SITE: Site = {
  settings: {},
  navigation: {},
  strings: {},
  i18n: { lang: 'en', defaultLang: 'en', languages: [{ code: 'en', name: 'English', locale: 'en_US' }] },
  nav: { sectors: [], products: [], pages: [] },
};

/** Adds ?lang= to an API path (omitted for the default language request). */
const q = (path: string, lang?: string) => (lang ? `${path}${path.includes('?') ? '&' : '?'}lang=${encodeURIComponent(lang)}` : path);

export const getSite = cache(async (lang?: string): Promise<Site> => (await get<Site>(q('/site', lang))) ?? EMPTY_SITE);
export const getHome = cache(async (lang?: string) => (await get<Home>(q('/home', lang))) ?? {});
export const getAbout = cache(async (lang?: string) => (await get<About>(q('/about', lang))) ?? {});
export const getContact = cache(async (lang?: string) => (await get<ContactPage>(q('/contact', lang))) ?? {});
export const getSectors = cache(async (lang?: string) => (await get<Sector[]>(q('/sectors', lang))) ?? []);
export const getSector = cache((slug: string, lang?: string) => get<Sector>(q(`/sectors/${encodeURIComponent(slug)}`, lang)));
export const getProducts = cache(async (lang?: string) => (await get<Product[]>(q('/products', lang))) ?? []);
export const getProduct = cache((slug: string, lang?: string) => get<Product>(q(`/products/${encodeURIComponent(slug)}`, lang)));
export const getPages = cache(async (lang?: string) => (await get<{ slug: string; title: string }[]>(q('/pages', lang))) ?? []);
export const getPage = cache((slug: string, lang?: string) => get<Page>(q(`/pages/${encodeURIComponent(slug)}`, lang)));
export const getSitemap = cache(async () => (await get<SitemapEntry[]>('/sitemap')) ?? []);

/** Public base URL of the website (CMS setting first, then env). */
export async function siteUrl(): Promise<string> {
  const { settings } = await getSite();
  return (settings.siteUrl || process.env.SITE_URL || 'http://localhost:3100').replace(/\/$/, '');
}

/** Turns CMS media paths (/uploads/x.png) into URLs served by this site. */
export function mediaUrl(src?: string): string | undefined {
  if (!src) return undefined;
  return src;
}
