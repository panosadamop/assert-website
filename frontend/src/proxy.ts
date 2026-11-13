import { NextResponse, type NextRequest } from 'next/server';

/**
 * 1. Redirects managed in the CMS (Settings → SEO → Redirects).
 * 2. Language routing: the default language has no prefix (/about is served by /en/about internally),
 *    other enabled languages use their code (/el/about). /en/about redirects to /about.
 * CMS data is cached in memory for 60 seconds per server process.
 */
const API_URL = (process.env.API_URL || 'http://localhost:4000').replace(/\/$/, '');
type Redirect = { from: string; to: string; permanent?: boolean };
type Langs = { defaultLang: string; languages: string[] };

const norm = (p: string) => (p.length > 1 ? p.replace(/\/+$/, '') : p).toLowerCase();

let redirectCache: { at: number; map: Map<string, Redirect> } = { at: 0, map: new Map() };
let langCache: { at: number; value: Langs } = { at: 0, value: { defaultLang: 'en', languages: ['en'] } };

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}/api/public/${path}`, { signal: AbortSignal.timeout(2000) });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

async function redirects() {
  if (Date.now() - redirectCache.at < 60_000) return redirectCache.map;
  const list = await fetchJson<Redirect[]>('redirects');
  redirectCache = list
    ? { at: Date.now(), map: new Map(list.map((r) => [norm(r.from), r])) }
    : { at: Date.now() - 45_000, map: redirectCache.map }; // retry sooner
  return redirectCache.map;
}

async function languages(): Promise<Langs> {
  if (Date.now() - langCache.at < 60_000) return langCache.value;
  const value = await fetchJson<Langs>('languages');
  langCache = value?.defaultLang ? { at: Date.now(), value } : { at: Date.now() - 45_000, value: langCache.value };
  return langCache.value;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const map = await redirects();
  const hit = map.size ? map.get(norm(pathname)) : undefined;
  if (hit) {
    const target = /^https?:\/\//.test(hit.to) ? hit.to : new URL(hit.to, req.url).toString();
    return NextResponse.redirect(target, hit.permanent === false ? 302 : 301);
  }

  const { defaultLang, languages: enabled } = await languages();
  const first = pathname.split('/')[1]?.toLowerCase() || '';

  // /en/about → /about (the default language never has a prefix)
  if (first === defaultLang) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(defaultLang.length + 1) || '/';
    return NextResponse.redirect(url, 308);
  }
  // /el/about → served as is
  if (first && enabled.includes(first)) return NextResponse.next();

  // /about → internally /en/about
  const url = req.nextUrl.clone();
  url.pathname = `/${defaultLang}${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next internals, API routes, media, OG images and files with an extension.
  matcher: ['/((?!_next/|api/|uploads/|og(?:/|$)|.*\\.[a-z0-9]+$).*)'],
};
