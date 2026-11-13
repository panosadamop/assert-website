import { BadRequestException, Injectable, Logger, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { JsonStore } from '../storage/json-store.service';
import { config } from '../config';
import { CONTENT_TYPES, ContentType, mergeTranslation, missingRequired, sanitizeObject, sanitizeTranslations, STRING_DEFAULTS, TYPES } from './schema';

export interface Language { code: string; name: string; locale: string; enabled: boolean }

const FALLBACK_LANGUAGES: Language[] = [{ code: 'en', name: 'English', locale: 'en_US', enabled: true }];

export interface Item extends Record<string, unknown> {
  id: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class ContentService implements OnApplicationBootstrap {
  private readonly logger = new Logger('Content');

  constructor(private readonly store: JsonStore) {}

  /** If the website was built while the CMS was offline, refresh it once the CMS is up. */
  onApplicationBootstrap() {
    setTimeout(() => void this.revalidateNow(), 5000).unref();
  }

  /* ---------------- types ---------------- */

  type(name: string, kind?: ContentType['kind']): ContentType {
    const t = TYPES.get(name);
    if (!t || (kind && t.kind !== kind)) throw new NotFoundException(`Unknown content type "${name}"`);
    return t;
  }

  types() {
    return CONTENT_TYPES;
  }

  /* ---------------- singletons ---------------- */

  getSingleton(name: string): Record<string, unknown> {
    this.type(name, 'singleton');
    return this.store.read<Record<string, unknown>>(name, {});
  }

  async saveSingleton(name: string, input: unknown) {
    const t = this.type(name, 'singleton');
    const data = sanitizeObject(t.fields, input);
    const langs = name === 'settings' ? this.parseLanguages(data.languages) : this.languages();
    data.translations = sanitizeTranslations(t.fields, (input as Record<string, unknown>)?.translations, this.translationCodes(langs));
    const missing = missingRequired(t.fields, data);
    if (missing.length) throw new BadRequestException(`Required: ${missing.join(', ')}`);
    const saved = await this.store.write(name, { ...data, updatedAt: new Date().toISOString() });
    this.revalidate();
    return saved;
  }

  /* ---------------- collections ---------------- */

  list(name: string): Item[] {
    this.type(name, 'collection');
    return this.store
      .read<Item[]>(name, [])
      .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0) || String(a.createdAt).localeCompare(String(b.createdAt)));
  }

  get(name: string, id: string): Item {
    const item = this.list(name).find((i) => i.id === id);
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  private prepare(t: ContentType, input: unknown, all: Item[], id?: string) {
    const data = sanitizeObject(t.fields, input);
    data.translations = sanitizeTranslations(t.fields, (input as Record<string, unknown>)?.translations, this.translationCodes(this.languages()));
    if (t.fields.some((f) => f.key === 'slug')) {
      if (!data.slug && t.titleField) {
        data.slug = sanitizeObject([{ key: 'slug', label: '', type: 'slug' }], { slug: data[t.titleField] }).slug;
      }
      if (all.some((i) => i.slug === data.slug && i.id !== id)) {
        throw new BadRequestException(`The slug "${data.slug}" is already used by another item.`);
      }
    }
    const missing = missingRequired(t.fields, data);
    if (missing.length) throw new BadRequestException(`Required: ${missing.join(', ')}`);
    return data;
  }

  async create(name: string, input: unknown): Promise<Item> {
    const t = this.type(name, 'collection');
    let created!: Item;
    await this.store.update<Item[]>(name, [], (all) => {
      const data = this.prepare(t, input, all);
      const now = new Date().toISOString();
      created = { ...data, id: randomUUID(), createdAt: now, updatedAt: now };
      return [...all, created];
    });
    this.revalidate();
    return created;
  }

  async update(name: string, id: string, input: unknown): Promise<Item> {
    const t = this.type(name, 'collection');
    let updated!: Item;
    await this.store.update<Item[]>(name, [], (all) => {
      const idx = all.findIndex((i) => i.id === id);
      if (idx < 0) throw new NotFoundException('Item not found');
      const data = this.prepare(t, input, all, id);
      updated = { ...data, id, createdAt: all[idx].createdAt, updatedAt: new Date().toISOString() };
      const next = [...all];
      next[idx] = updated;
      return next;
    });
    this.revalidate();
    return updated;
  }

  async remove(name: string, id: string) {
    this.type(name, 'collection');
    await this.store.update<Item[]>(name, [], (all) => {
      if (!all.some((i) => i.id === id)) throw new NotFoundException('Item not found');
      return all.filter((i) => i.id !== id);
    });
    this.revalidate();
    return { ok: true };
  }

  async reorder(name: string, ids: string[]) {
    this.type(name, 'collection');
    await this.store.update<Item[]>(name, [], (all) =>
      all.map((i) => ({ ...i, order: ids.indexOf(i.id) >= 0 ? ids.indexOf(i.id) + 1 : Number(i.order ?? 999) })),
    );
    this.revalidate();
    return { ok: true };
  }

  /* ---------------- languages ---------------- */

  private parseLanguages(raw: unknown): Language[] {
    const list = (Array.isArray(raw) ? raw : [])
      .map((l: Record<string, unknown>) => ({
        code: String(l?.code || '').trim().toLowerCase(),
        name: String(l?.name || l?.code || '').trim(),
        locale: String(l?.locale || '').trim(),
        enabled: l?.enabled !== false,
      }))
      .filter((l) => /^[a-z]{2,3}(-[a-z0-9]{2,8})?$/.test(l.code));
    const unique = list.filter((l, i) => list.findIndex((x) => x.code === l.code) === i);
    if (!unique.length) return FALLBACK_LANGUAGES;
    unique[0].enabled = true; // the default language is always on
    return unique;
  }

  /** All configured languages; the first one is the default. */
  languages(): Language[] {
    return this.parseLanguages(this.store.read<Record<string, unknown>>('settings', {}).languages);
  }

  defaultLanguage(): string {
    return this.languages()[0].code;
  }

  private translationCodes(langs: Language[]): string[] {
    return langs.slice(1).map((l) => l.code);
  }

  /** Resolves a requested language to an enabled one (or the default). */
  resolveLang(lang?: string): string {
    const code = String(lang || '').toLowerCase();
    const l = this.languages().find((x) => x.code === code && x.enabled);
    return l ? l.code : this.defaultLanguage();
  }

  /** Returns the object in the requested language (translations merged, internal key removed). */
  localize<T extends Record<string, unknown>>(name: string, obj: T, lang?: string): T {
    const { translations, ...base } = obj as Record<string, unknown>;
    const code = this.resolveLang(lang);
    if (code === this.defaultLanguage() || !translations) return base as T;
    const tr = (translations as Record<string, unknown>)[code];
    return mergeTranslation(this.type(name).fields, base, tr) as T;
  }

  /* ---------------- public projections ---------------- */

  published(name: string, lang?: string): Item[] {
    return this.list(name).filter((i) => i.published).map((i) => this.localize(name, i, lang));
  }

  publishedBySlug(name: string, slug: string, lang?: string): Item {
    const item = this.published(name, lang).find((i) => i.slug === slug);
    if (!item) throw new NotFoundException('Not found');
    return item;
  }

  publicSingleton(name: string, lang?: string): Record<string, unknown> {
    return this.localize(name, this.getSingleton(name), lang);
  }

  card(i: Item) {
    const { id, slug, name, title, icon, summary, tagline, category, logo, featured, order, externalUrl, image } = i as Record<string, unknown>;
    return { id, slug, name, title, icon, summary, tagline, category, logo, featured, order, externalUrl, image };
  }

  site(lang?: string) {
    const code = this.resolveLang(lang);
    const settings = this.publicSingleton('settings', code);
    delete settings.languages;
    return {
      settings,
      navigation: this.publicSingleton('navigation', code),
      // Interface texts: CMS values (in this language) over the built-in English defaults.
      strings: {
        ...STRING_DEFAULTS,
        ...Object.fromEntries(Object.entries(this.publicSingleton('strings', code)).filter(([k, v]) => k !== 'updatedAt' && typeof v === 'string' && v.trim())),
      },
      i18n: {
        lang: code,
        defaultLang: this.defaultLanguage(),
        languages: this.languages().filter((l) => l.enabled).map(({ code: c, name, locale }) => ({ code: c, name, locale })),
      },
      nav: {
        sectors: this.published('sectors', code).map((i) => this.card(i)),
        products: this.published('products', code).map((i) => this.card(i)),
        pages: this.published('pages', code)
          .filter((p) => p.showInFooter)
          .map((p) => ({ slug: p.slug, title: p.title })),
      },
    };
  }

  sitemap() {
    const entry = (path: string, updatedAt: unknown, priority: number, noindex?: unknown) => ({
      path,
      updatedAt: updatedAt || new Date().toISOString(),
      priority,
      noindex: !!noindex,
    });
    const seoOf = (o: Record<string, unknown>) => (o.seo || {}) as Record<string, unknown>;
    const home = this.getSingleton('home');
    const about = this.getSingleton('about');
    const contact = this.getSingleton('contact');
    const latest = (items: Item[]) => items.map((i) => i.updatedAt).sort().pop();
    return [
      entry('/', home.updatedAt, 1, seoOf(home).noindex),
      entry('/about', about.updatedAt, 0.8, seoOf(about).noindex),
      entry('/sectors', latest(this.published('sectors')), 0.8),
      ...this.published('sectors').map((i) => entry(`/sectors/${i.slug}`, i.updatedAt, 0.8, seoOf(i).noindex)),
      entry('/products', latest(this.published('products')), 0.9),
      ...this.published('products').map((i) => entry(`/products/${i.slug}`, i.updatedAt, 0.9, seoOf(i).noindex)),
      entry('/contact', contact.updatedAt, 0.6, seoOf(contact).noindex),
      ...this.published('pages').map((i) => entry(`/${i.slug}`, i.updatedAt, 0.3, seoOf(i).noindex)),
    ].filter((e) => !e.noindex);
  }

  redirects() {
    const s = this.getSingleton('settings');
    return ((s.redirects as { from: string; to: string; permanent: boolean }[]) || []).filter((r) => r.from && r.to);
  }

  /* ---------------- frontend cache refresh ---------------- */

  private timer?: NodeJS.Timeout;

  /** Tells the Next.js site to drop its cache (debounced). */
  revalidate(): void {
    if (!config.revalidateSecret) return;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      void this.revalidateNow().then((r) => {
        if (!r.ok) this.logger.warn(`Site revalidation failed (${config.frontendUrl}): ${r.error}`);
      });
    }, 400);
  }

  async revalidateNow(): Promise<{ ok: boolean; error?: string }> {
    if (!config.revalidateSecret) return { ok: false, error: 'REVALIDATE_SECRET is not set' };
    try {
      const res = await fetch(`${config.frontendUrl}/api/revalidate`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-revalidate-secret': config.revalidateSecret },
        body: JSON.stringify({ all: true }),
        signal: AbortSignal.timeout(8000),
      });
      return res.ok ? { ok: true } : { ok: false, error: `HTTP ${res.status}` };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }
}
