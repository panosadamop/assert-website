'use client';

import { usePathname } from 'next/navigation';
import type { LangOption } from './nav-types';

/** Links to the same page in the other languages. Hidden when only one language is enabled. */
export function LanguageSwitcher({ languages, current, defaultLang, label, className }: {
  languages: LangOption[]; current: string; defaultLang: string; label: string; className?: string;
}) {
  const pathname = usePathname() || '/';
  if (languages.length < 2) return null;

  // Path without any language prefix.
  const segs = pathname.split('/');
  const codes = languages.map((l) => l.code).concat(defaultLang);
  const rest = codes.includes(segs[1]) ? `/${segs.slice(2).join('/')}` : pathname;
  const to = (code: string) => (code === defaultLang ? rest || '/' : `/${code}${rest === '/' ? '' : rest}`);

  return (
    <nav aria-label={label} className={`lang-switch ${className || ''}`.trim()}>
      <ul>
        {languages.map((l) => (
          <li key={l.code}>
            {/* Full page load: the whole page (incl. <html lang>) changes language. */}
            <a href={to(l.code)} lang={l.code} hrefLang={l.code} aria-current={l.code === current ? 'true' : undefined}>
              <span>{l.code.toUpperCase()}</span>
              <span className="sr-only"> – {l.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
