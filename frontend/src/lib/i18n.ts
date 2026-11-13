import 'server-only';
import { cache } from 'react';
import { lang as rootLang } from 'next/root-params';
import { getSite } from './cms';
import type { Site } from './types';

/** Paths that are never language-prefixed (files, API, media). */
const UNPREFIXED = /^\/(api|uploads|og|_next)(\/|$)|\.[a-z0-9]+$/i;

/** Prefixes an internal path with the language (e.g. /about → /el/about). External links are untouched. */
export function localizePath(prefix: string, url?: string): string {
  const u = url || '/';
  if (!prefix || !u.startsWith('/') || u.startsWith('//') || UNPREFIXED.test(u.split(/[?#]/)[0])) return u;
  return u === '/' ? prefix : `${prefix}${u}`;
}

/** Replaces %s (first value) and %n (second value) in an interface text. */
export function format(text: string, a = '', b = ''): string {
  return text.replace(/%s/g, a).replace(/%n/g, b);
}

export type I18n = {
  lang: string;
  site: Site;
  /** "" for the default language, "/el" for others. */
  prefix: string;
  /** Interface text (with optional %s / %n values). */
  t: (key: string, a?: string, b?: string) => string;
  /** Language-aware internal link. */
  href: (path?: string) => string;
  /** Locale like en_US for the current language. */
  locale: string;
};

/**
 * Everything a server component needs for the current language.
 * The language comes from the [lang] route segment (the proxy maps "/about" to "/en/about").
 */
export const getI18n = cache(async (): Promise<I18n> => {
  let lang = '';
  try {
    lang = ((await rootLang()) as string) || '';
  } catch {
    lang = '';
  }
  const site = await getSite(lang || undefined);
  const { i18n } = site;
  const current = i18n.languages.find((l) => l.code === i18n.lang) || i18n.languages[0];
  const prefix = i18n.lang === i18n.defaultLang ? '' : `/${i18n.lang}`;
  return {
    lang: i18n.lang,
    site,
    prefix,
    t: (key, a, b) => format(site.strings[key] ?? key, a, b),
    href: (path) => localizePath(prefix, path),
    locale: current?.locale || site.settings.seo?.locale || 'en_US',
  };
});
