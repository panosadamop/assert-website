'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { LanguageSwitcher } from './LanguageSwitcher';
import type { LangOption, NavItem } from './nav-types';

type Labels = { open: string; close: string; nav: string; language: string; newTab: string };

/**
 * Mobile menu. Accessible: aria-expanded toggle, focus moves into the menu, Tab stays inside,
 * Esc closes and returns focus to the toggle, the page behind is made inert.
 */
export function MobileNav({ items, cta, languages, lang, defaultLang, labels }: {
  items: NavItem[]; cta: { label: string; href: string }; languages: LangOption[]; lang: string; defaultLang: string; labels: Labels;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const behind = [document.getElementById('main'), document.querySelector<HTMLElement>('.site-footer')];
    document.body.style.overflow = open ? 'hidden' : '';
    behind.forEach((el) => { if (el) el.inert = open; });
    if (open) panel.current?.querySelector<HTMLElement>('a[href], button')?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') {
        setOpen(false);
        toggle.current?.focus();
        return;
      }
      if (e.key !== 'Tab' || !panel.current) return;
      const focusables = [toggle.current, ...panel.current.querySelectorAll<HTMLElement>('a[href], button')].filter(Boolean) as HTMLElement[];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      behind.forEach((el) => { if (el) el.inert = false; });
    };
  }, [open]);

  const ext = (it: { newTab?: boolean }) => (it.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {});

  return (
    <>
      <button ref={toggle} type="button" className="menu-toggle" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>
        <Icon name={open ? 'close' : 'menu'} size={26} />
        <span className="sr-only">{open ? labels.close : labels.open}</span>
      </button>
      <div id="mobile-nav" ref={panel} className={`mobile-nav${open ? ' open' : ''}`} hidden={!open}>
        <nav aria-label={labels.nav}>
          <ul className="mobile-list">
            {items.map((it) => (
              <li key={it.href + it.label}>
                {it.children?.length ? (
                  <>
                    <Link href={it.href} className="mobile-group">{it.label}</Link>
                    <ul>
                      {it.children.map((c) => <li key={c.href}><Link href={c.href}>{c.label}</Link></li>)}
                    </ul>
                  </>
                ) : (
                  <Link href={it.href} {...ext(it)}>
                    {it.label}
                    {it.newTab ? <span className="sr-only"> {labels.newTab}</span> : null}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <LanguageSwitcher languages={languages} current={lang} defaultLang={defaultLang} label={labels.language} className="mobile" />
        <Link href={cta.href} className="btn btn-accent">{cta.label}</Link>
      </div>
    </>
  );
}
