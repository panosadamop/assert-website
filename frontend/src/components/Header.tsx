import Link from 'next/link';
import { getI18n } from '@/lib/i18n';
import type { Navigation } from '@/lib/types';
import { MobileNav } from './MobileNav';
import { HeaderScroll } from './HeaderScroll';
import { NavDropdown } from './NavDropdown';
import { LanguageSwitcher } from './LanguageSwitcher';
import { SmartLink } from './SmartLink';
import type { NavItem } from './nav-types';

/** Header menu from CMS → Menus (falls back to the classic menu when it is empty). */
export async function Header() {
  const { site, t, href, lang } = await getI18n();
  const { settings, nav, navigation, i18n } = site;
  const logo = settings.logo || '/logo-white.png';
  const cta = settings.headerCta?.label ? settings.headerCta : { label: t('contactUs'), url: '/contact' };

  const header: NonNullable<Navigation['header']> = navigation.header?.length
    ? navigation.header
    : [
        { label: t('sectors'), kind: 'sectors', url: '/sectors' },
        { label: t('products'), kind: 'products', url: '/products' },
        { label: 'About', kind: 'link', url: '/about' },
        { label: 'Contact', kind: 'link', url: '/contact' },
      ];

  const items: NavItem[] = header
    .filter((h) => h.label)
    .map((h) => {
      const external = /^(https?:)?\/\//.test(h.url || '');
      const item: NavItem = { label: h.label || '', href: external ? h.url || '#' : href(h.url || '/'), newTab: h.newTab || external };
      if (h.kind === 'sectors') {
        item.href = href(h.url || '/sectors');
        item.children = nav.sectors.map((s) => ({ label: s.name || '', href: href(`/sectors/${s.slug}`), description: s.summary, icon: s.icon }));
      } else if (h.kind === 'products') {
        item.href = href(h.url || '/products');
        item.children = nav.products.map((p) => ({ label: p.name || '', href: href(`/products/${p.slug}`), description: p.tagline || p.summary, icon: p.icon }));
      }
      return item;
    });

  return (
    <>
      {settings.announcement ? <div className="announcement">{settings.announcement}</div> : null}
      <HeaderScroll />
      <header className="site-header">
        <div className="container header-inner">
          <Link href={href('/')} className="brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt={`${settings.siteName || 'ASSERT'} – ${t('home')}`} width={217} height={40} />
          </Link>
          <nav className="main-nav" aria-label={t('mainMenu')}>
            {items.map((it) =>
              it.children?.length ? (
                <NavDropdown key={it.href + it.label} item={it} toggleLabel={t('showSubmenu', it.label)} />
              ) : (
                <div className="nav-item" key={it.href + it.label}>
                  {it.newTab ? (
                    <a href={it.href} target="_blank" rel="noopener noreferrer">{it.label}<span className="sr-only"> {t('opensInNewTab')}</span></a>
                  ) : (
                    <Link href={it.href}>{it.label}</Link>
                  )}
                </div>
              ),
            )}
          </nav>
          <LanguageSwitcher languages={i18n.languages} current={lang} defaultLang={i18n.defaultLang} label={t('language')} className="desktop" />
          <SmartLink href={cta.url || '/contact'} className="btn btn-accent header-cta">{cta.label}</SmartLink>
          <MobileNav
            items={items}
            cta={{ label: cta.label || t('contactUs'), href: href(cta.url || '/contact') }}
            languages={i18n.languages}
            lang={lang}
            defaultLang={i18n.defaultLang}
            labels={{ open: t('openMenu'), close: t('closeMenu'), nav: t('mainMenu'), language: t('language'), newTab: t('opensInNewTab') }}
          />
        </div>
      </header>
    </>
  );
}
