import '@fontsource/ubuntu/300.css';
import '@fontsource/ubuntu/400.css';
import '@fontsource/ubuntu/500.css';
import '@fontsource/ubuntu/700.css';
import '../globals.css';
import type { Metadata, Viewport } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import { getSite, siteUrl } from '@/lib/cms';
import { getI18n } from '@/lib/i18n';
import { graph, organizationLd, websiteLd } from '@/lib/seo';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { JsonLd } from '@/components/JsonLd';
import { Analytics } from '@/components/Analytics';

export const revalidate = 300;

/** Pre-render every enabled language. */
export async function generateStaticParams() {
  const { i18n } = await getSite();
  return i18n.languages.map((l) => ({ lang: l.code }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getI18n();
  const { settings } = site;
  const base = await siteUrl();
  const s = settings.seo || {};
  const v = settings.verification || {};
  const name = settings.siteName || 'ASSERT';
  return {
    metadataBase: new URL(base),
    title: { default: s.defaultTitle || name, template: s.titleTemplate?.includes('%s') ? s.titleTemplate : `%s | ${name}` },
    description: s.defaultDescription || settings.tagline,
    applicationName: name,
    authors: [{ name, url: base }],
    creator: name,
    publisher: settings.organization?.legalName || name,
    formatDetection: { telephone: false, email: false, address: false },
    verification: {
      google: v.google || undefined,
      yandex: v.yandex || undefined,
      other: v.bing ? { 'msvalidate.01': v.bing } : undefined,
    },
    alternates: { types: { 'text/plain': `${base}/llms.txt` } },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const { site } = await getI18n();
  // No maximum-scale / user-scalable=no: visitors must be able to zoom (WCAG 1.4.4).
  return { themeColor: site.settings.primaryColor || '#20282d', width: 'device-width', initialScale: 1 };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { site, lang, t, href } = await getI18n();
  const base = await siteUrl();
  const { settings } = site;
  const style = {
    '--primary': settings.primaryColor || '#20282d',
    '--accent': settings.accentColor || '#3cc6e0',
  } as CSSProperties;
  const policy = settings.cookies?.policyUrl;

  return (
    <html lang={lang} style={style}>
      <body
        data-error-kicker={t('errorKicker')}
        data-error-title={t('errorTitle')}
        data-error-text={t('errorText')}
        data-error-retry={t('tryAgain')}
      >
        <a href="#main" className="skip-link">{t('skipToContent')}</a>
        {/* Early in the reading order so keyboard and screen-reader users meet it first; shown at the bottom. */}
        <Analytics settings={settings} policyHref={policy ? (/^https?:/.test(policy) ? policy : href(policy)) : undefined} />
        <Header />
        <main id="main" tabIndex={-1}>{children}</main>
        <Footer />
        <JsonLd data={graph(organizationLd(settings, base), websiteLd(settings, base, lang))} />
      </body>
    </html>
  );
}
