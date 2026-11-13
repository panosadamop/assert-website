import type { MetadataRoute } from 'next';
import { getSite, siteUrl } from '@/lib/cms';

export const revalidate = 300;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const [{ settings }, base] = await Promise.all([getSite(), siteUrl()]);
  if (settings.seo?.allowIndexing === false) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', ...(settings.seo?.robotsDisallow || [])],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
