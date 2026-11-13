export interface Seo {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
}

export interface Link {
  label?: string;
  url?: string;
}

export interface TitleText {
  title?: string;
  text?: string;
}

export interface Settings {
  siteName?: string;
  siteUrl?: string;
  tagline?: string;
  logo?: string;
  logoDark?: string;
  primaryColor?: string;
  accentColor?: string;
  headerCta?: Link;
  footerText?: string;
  announcement?: string;
  contact?: { email?: string; phone?: string; street?: string; city?: string; postalCode?: string; country?: string; mapUrl?: string };
  socialLinks?: SocialLink[];
  showSocialInFooter?: boolean;
  showSocialOnContact?: boolean;
  cookies?: CookieTexts;
  seo?: {
    defaultTitle?: string;
    titleTemplate?: string;
    defaultDescription?: string;
    keywords?: string[];
    defaultOgImage?: string;
    locale?: string;
    twitterHandle?: string;
    allowIndexing?: boolean;
    robotsDisallow?: string[];
  };
  verification?: { google?: string; bing?: string; yandex?: string };
  organization?: { legalName?: string; foundingYear?: string; vatId?: string; description?: string };
  redirects?: { from: string; to: string; permanent?: boolean }[];
  analytics?: { gaMeasurementId?: string; gtmId?: string; plausibleDomain?: string };
}

export interface Card {
  id: string;
  slug: string;
  name?: string;
  title?: string;
  icon?: string;
  summary?: string;
  tagline?: string;
  category?: string;
  logo?: string;
  featured?: boolean;
  externalUrl?: string;
  image?: string;
}

export interface SocialLink {
  network?: string;
  url?: string;
  label?: string;
}

export interface CookieTexts {
  enabled?: boolean;
  title?: string;
  text?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  customizeLabel?: string;
  saveLabel?: string;
  policyLabel?: string;
  policyUrl?: string;
  necessaryTitle?: string;
  necessaryText?: string;
  analyticsTitle?: string;
  analyticsText?: string;
}

export interface MenuLink {
  label?: string;
  url?: string;
  newTab?: boolean;
}

export interface Navigation {
  header?: (MenuLink & { kind?: 'link' | 'sectors' | 'products' })[];
  footer?: { title?: string; kind?: 'links' | 'sectors' | 'products' | 'contact'; links?: MenuLink[] }[];
  legal?: MenuLink[];
}

export interface Language {
  code: string;
  name: string;
  locale?: string;
}

export interface Site {
  settings: Settings;
  navigation: Navigation;
  strings: Record<string, string>;
  i18n: { lang: string; defaultLang: string; languages: Language[] };
  nav: { sectors: Card[]; products: Card[]; pages: { slug: string; title: string }[] };
}

export interface Home {
  hero?: { eyebrow?: string; headline?: string; subheadline?: string; image?: string; primaryCta?: Link; secondaryCta?: Link };
  intro?: { title?: string; text?: string };
  stats?: { value?: string; label?: string }[];
  sectorsTitle?: string;
  sectorsIntro?: string;
  productsTitle?: string;
  productsIntro?: string;
  whyTitle?: string;
  why?: TitleText[];
  processTitle?: string;
  process?: TitleText[];
  cta?: { title?: string; text?: string; label?: string; url?: string };
  seo?: Seo;
  sectors?: Card[];
  products?: Card[];
  updatedAt?: string;
}

export interface About {
  title?: string;
  headline?: string;
  intro?: string;
  missionTitle?: string;
  mission?: string;
  valuesTitle?: string;
  values?: TitleText[];
  image?: string;
  seo?: Seo;
}

export interface ContactPage {
  title?: string;
  headline?: string;
  intro?: string;
  sectorOptions?: string[];
  productOptions?: string[];
  consentText?: string;
  successMessage?: string;
  seo?: Seo;
}

export interface Sector extends Card {
  headline?: string;
  intro?: string;
  capabilitiesTitle?: string;
  capabilities?: TitleText[];
  seo?: Seo;
  updatedAt?: string;
}

export interface Product extends Card {
  description?: string;
  featuresTitle?: string;
  features?: TitleText[];
  stepsTitle?: string;
  steps?: TitleText[];
  integrationsTitle?: string;
  integrations?: { group?: string; items?: string[] }[];
  audienceTitle?: string;
  audience?: string[];
  highlights?: string[];
  cta?: { title?: string; text?: string; label?: string; url?: string };
  seo?: Seo;
  updatedAt?: string;
}

export interface Section {
  type?: 'text' | 'textImage' | 'image' | 'features' | 'cards' | 'steps' | 'stats' | 'sectors' | 'products' | 'contactForm' | 'cta';
  background?: 'light' | 'alt' | 'dark';
  eyebrow?: string;
  title?: string;
  intro?: string;
  text?: string;
  image?: string;
  imageAlt?: string;
  imagePosition?: 'left' | 'right';
  items?: (TitleText & { icon?: string })[];
  buttonLabel?: string;
  buttonUrl?: string;
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  eyebrow?: string;
  intro?: string;
  heroImage?: string;
  primaryCta?: Link;
  secondaryCta?: Link;
  body?: string;
  sections?: Section[];
  seo?: Seo;
  updatedAt?: string;
}

export interface SitemapEntry {
  path: string;
  updatedAt: string;
  priority: number;
}
