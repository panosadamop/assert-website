import Link from 'next/link';
import type { CSSProperties } from 'react';
import { getI18n } from '@/lib/i18n';
import type { MenuLink, Navigation } from '@/lib/types';
import { Icon } from './Icon';
import { SmartLink } from './SmartLink';
import { SocialLinks } from './SocialLinks';
import { CookieSettingsButton } from './CookieConsent';

export async function Footer() {
  const { site, t, href } = await getI18n();
  const { settings, nav, navigation } = site;
  const c = settings.contact || {};
  const year = new Date().getFullYear();

  const columns: NonNullable<Navigation['footer']> = navigation.footer?.length
    ? navigation.footer
    : [
        { title: t('sectors'), kind: 'sectors' },
        { title: t('products'), kind: 'products' },
        { title: t('contactDetails'), kind: 'contact', links: [{ label: 'About', url: '/about' }] },
      ];

  const linkList = (links: MenuLink[] = []) =>
    links.filter((l) => l.label && l.url).map((l, i) => (
      <li key={i}><SmartLink href={l.url} newTab={l.newTab}>{l.label}</SmartLink></li>
    ));

  const showSocial = settings.showSocialInFooter !== false;
  const cookiesOn = settings.cookies?.enabled !== false;

  return (
    <footer className="site-footer">
      <div className="container footer-grid" style={{ '--cols': columns.length } as CSSProperties}>
        <div className="footer-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={settings.logo || '/logo-white.png'} alt={settings.siteName || 'ASSERT'} width={140} height={26} loading="lazy" />
          {settings.footerText ? <p>{settings.footerText}</p> : null}
          {showSocial ? <SocialLinks /> : null}
        </div>
        {columns.map((col, i) => (
          <div key={i}>
            {col.title ? <h2>{col.title}</h2> : null}
            {col.kind === 'sectors' ? (
              <ul>{nav.sectors.map((s) => <li key={s.slug}><Link href={href(`/sectors/${s.slug}`)}>{s.name}</Link></li>)}</ul>
            ) : col.kind === 'products' ? (
              <ul>{nav.products.map((p) => <li key={p.slug}><Link href={href(`/products/${p.slug}`)}>{p.name}</Link></li>)}</ul>
            ) : col.kind === 'contact' ? (
              <ul className="contact-list">
                {c.email ? <li><Icon name="mail" size={16} /><a href={`mailto:${c.email}`}>{c.email}</a></li> : null}
                {c.phone ? <li><Icon name="phone" size={16} /><a href={`tel:${c.phone.replace(/\s/g, '')}`}>{c.phone}</a></li> : null}
                {c.street || c.city ? (
                  <li><Icon name="pin" size={16} /><span>{[c.street, [c.postalCode, c.city].filter(Boolean).join(' ')].filter(Boolean).join(', ')}</span></li>
                ) : null}
                {linkList(col.links)}
              </ul>
            ) : (
              <ul>{linkList(col.links)}</ul>
            )}
          </div>
        ))}
      </div>
      <div className="container footer-bottom">
        <span>© {year} {settings.organization?.legalName || settings.siteName || 'ASSERT'}. {t('allRightsReserved')}</span>
        <ul className="footer-links">
          {(navigation.legal || []).filter((l) => l.label && l.url).map((l, i) => <li key={`l${i}`}><SmartLink href={l.url}>{l.label}</SmartLink></li>)}
          {nav.pages.map((p) => <li key={p.slug}><Link href={href(`/${p.slug}`)}>{p.title}</Link></li>)}
          <li><a href="/sitemap.xml">{t('sitemap')}</a></li>
          {cookiesOn ? <li><CookieSettingsButton label={settings.cookies?.customizeLabel || t('cookieSettings')} /></li> : null}
        </ul>
      </div>
    </footer>
  );
}
