import type { MetadataRoute } from 'next';
import { getSitemap, getSite, siteUrl } from '@/lib/cms';

export const revalidate = 300;

/** One entry per page and language, with hreflang alternates between the language versions. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [entries, base, site] = await Promise.all([getSitemap(), siteUrl(), getSite()]);
  const { languages, defaultLang } = site.i18n;
  const list = entries.length ? entries : [{ path: '/', updatedAt: new Date().toISOString(), priority: 1 }];
  const url = (code: string, path: string) => `${base}${code === defaultLang ? '' : `/${code}`}${path === '/' ? '' : path}` || base;
  return list.flatMap((e) =>
    languages.map((l) => ({
      url: url(l.code, e.path),
      lastModified: new Date(e.updatedAt),
      changeFrequency: e.priority >= 0.9 ? ('weekly' as const) : ('monthly' as const),
      priority: e.priority,
      alternates: languages.length > 1 ? { languages: Object.fromEntries(languages.map((x) => [x.code, url(x.code, e.path)])) } : undefined,
    })),
  );
}
