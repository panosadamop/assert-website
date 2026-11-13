import type { MetadataRoute } from 'next';
import { getSite } from '@/lib/cms';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { settings } = await getSite();
  return {
    name: settings.siteName || 'ASSERT',
    short_name: settings.siteName || 'ASSERT',
    description: settings.seo?.defaultDescription || settings.tagline,
    start_url: '/',
    display: 'standalone',
    background_color: settings.primaryColor || '#20282d',
    theme_color: settings.primaryColor || '#20282d',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
