import { Body, Controller, Get, HttpCode, Param, Post, Query, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { ContentService } from './content.service';
import { MessagesService } from './messages.service';

/**
 * Read-only API consumed by the Next.js website (plus the contact form).
 * Every content endpoint accepts ?lang=<code>; missing translations fall back to the default language.
 */
@Controller('api/public')
export class PublicController {
  constructor(
    private readonly content: ContentService,
    private readonly messages: MessagesService,
  ) {}

  @Get('site')
  site(@Query('lang') lang?: string) {
    return this.content.site(lang);
  }

  @Get('languages')
  languages() {
    const all = this.content.languages();
    return { defaultLang: all[0].code, languages: all.filter((l) => l.enabled).map((l) => l.code) };
  }

  @Get('home')
  home(@Query('lang') lang?: string) {
    return {
      ...this.content.publicSingleton('home', lang),
      sectors: this.content.published('sectors', lang).map((i) => this.content.card(i)),
      products: this.content.published('products', lang).map((i) => this.content.card(i)),
    };
  }

  @Get('about')
  about(@Query('lang') lang?: string) {
    return this.content.publicSingleton('about', lang);
  }

  @Get('contact')
  contact(@Query('lang') lang?: string) {
    return this.content.publicSingleton('contact', lang);
  }

  @Get('sectors')
  sectors(@Query('lang') lang?: string) {
    return this.content.published('sectors', lang);
  }

  @Get('sectors/:slug')
  sector(@Param('slug') slug: string, @Query('lang') lang?: string) {
    return this.content.publishedBySlug('sectors', slug, lang);
  }

  @Get('products')
  products(@Query('lang') lang?: string) {
    return this.content.published('products', lang);
  }

  @Get('products/:slug')
  product(@Param('slug') slug: string, @Query('lang') lang?: string) {
    return this.content.publishedBySlug('products', slug, lang);
  }

  @Get('pages')
  pages(@Query('lang') lang?: string) {
    return this.content.published('pages', lang).map((p) => ({ slug: p.slug, title: p.title }));
  }

  @Get('pages/:slug')
  page(@Param('slug') slug: string, @Query('lang') lang?: string) {
    return this.content.publishedBySlug('pages', slug, lang);
  }

  @Get('sitemap')
  sitemap() {
    return this.content.sitemap();
  }

  @Get('redirects')
  redirects() {
    return this.content.redirects();
  }

  @Post('contact')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  submit(@Body() body: Record<string, unknown>, @Req() req: Request) {
    const fwd = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    return this.messages.submit(body || {}, fwd || req.ip || '');
  }
}
