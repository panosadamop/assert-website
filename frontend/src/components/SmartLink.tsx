import Link from 'next/link';
import type { ReactNode } from 'react';
import { getI18n } from '@/lib/i18n';

const isExternal = (url: string) => /^(https?:)?\/\//.test(url);

/**
 * Internal links use next/link and get the current language prefix (/about → /el/about).
 * External links open in a new tab and announce it to screen-reader users.
 */
export async function SmartLink({ href, className, children, newTab, ...rest }: {
  href?: string; className?: string; children: ReactNode; newTab?: boolean; 'aria-current'?: 'page';
}) {
  const { href: localize, t } = await getI18n();
  const url = href || '#';
  if (isExternal(url) || url.startsWith('mailto:') || url.startsWith('tel:') || newTab) {
    const blank = isExternal(url) || newTab;
    return (
      <a href={isExternal(url) ? url : localize(url)} className={className} {...rest} {...(blank ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {children}
        {blank ? <span className="sr-only"> {t('opensInNewTab')}</span> : null}
      </a>
    );
  }
  return (
    <Link href={localize(url)} className={className} {...rest}>
      {children}
    </Link>
  );
}

/** Shorthand for internal links in server components. */
export async function LocalLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const { href: localize } = await getI18n();
  return <Link href={localize(href)} className={className}>{children}</Link>;
}
