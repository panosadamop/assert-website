/**
 * Content model for the CMS. The admin panel renders its forms from these definitions
 * and the API sanitises every save against them (unknown keys are dropped, types coerced).
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'markdown'
  | 'url'
  | 'email'
  | 'image'
  | 'color'
  | 'number'
  | 'boolean'
  | 'select'
  | 'slug'
  | 'list'
  | 'group'
  | 'repeater';

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  help?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  fields?: Field[]; // group / repeater
  itemLabel?: string; // repeater: key used as the item title in the admin
  max?: number; // text max length
  placeholder?: string;
  tab?: string; // groups fields into tabs in the admin
  noTranslate?: boolean; // same value in every language (not shown when translating)
  when?: string[]; // only shown when the sibling "type"/"kind" field has one of these values
}

export interface ContentType {
  name: string;
  label: string;
  kind: 'singleton' | 'collection';
  description?: string;
  icon?: string;
  titleField?: string;
  previewPath?: string; // e.g. /sectors/:slug
  fields: Field[];
}

const ICONS = [
  { value: 'shield', label: 'Shield (Defense)' },
  { value: 'bolt', label: 'Bolt (Energy)' },
  { value: 'building', label: 'Building (Enterprise)' },
  { value: 'chart', label: 'Chart (Data)' },
  { value: 'scale', label: 'Scales (Legal)' },
  { value: 'coffee', label: 'Coffee cup' },
  { value: 'network', label: 'Network' },
  { value: 'gov', label: 'Government' },
  { value: 'ship', label: 'Ship (Maritime)' },
  { value: 'truck', label: 'Truck (Logistics)' },
  { value: 'health', label: 'Health' },
  { value: 'cpu', label: 'Chip (AI)' },
];

const SECTION_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'textImage', label: 'Text with image' },
  { value: 'image', label: 'Image' },
  { value: 'features', label: 'Feature list (with ticks)' },
  { value: 'cards', label: 'Numbered cards' },
  { value: 'steps', label: 'Process steps' },
  { value: 'stats', label: 'Figures' },
  { value: 'sectors', label: 'All sectors (cards)' },
  { value: 'products', label: 'All products (cards)' },
  { value: 'contactForm', label: 'Contact form' },
  { value: 'cta', label: 'Call to action band' },
];

export const SOCIAL_NETWORKS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'threads', label: 'Threads' },
  { value: 'bluesky', label: 'Bluesky' },
  { value: 'mastodon', label: 'Mastodon' },
  { value: 'github', label: 'GitHub' },
  { value: 'vimeo', label: 'Vimeo' },
  { value: 'pinterest', label: 'Pinterest' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'website', label: 'Other website' },
];

const MENU_KINDS = [
  { value: 'link', label: 'Simple link' },
  { value: 'sectors', label: 'Dropdown: all sectors' },
  { value: 'products', label: 'Dropdown: all products' },
];

/** Fixed interface texts. The key is used by the website; the placeholder is the English default. */
const STRINGS: [string, string, string][] = [
  // [tab, key, English default]
  ['Navigation', 'skipToContent', 'Skip to content'],
  ['Navigation', 'mainMenu', 'Main menu'],
  ['Navigation', 'openMenu', 'Open menu'],
  ['Navigation', 'closeMenu', 'Close menu'],
  ['Navigation', 'showSubmenu', 'Show submenu for %s'],
  ['Navigation', 'language', 'Language'],
  ['Navigation', 'breadcrumb', 'Breadcrumb'],
  ['Navigation', 'home', 'Home'],
  ['Navigation', 'sectors', 'Sectors'],
  ['Navigation', 'products', 'Products'],
  ['Navigation', 'company', 'Company'],
  ['Navigation', 'opensInNewTab', '(opens in a new tab)'],
  ['Navigation', 'followUs', 'Follow us'],
  ['Navigation', 'socialOn', '%s on %n'],
  ['Navigation', 'allRightsReserved', 'All rights reserved.'],
  ['Navigation', 'sitemap', 'Sitemap'],
  ['Navigation', 'cookieSettings', 'Cookie settings'],
  ['Pages', 'learnMore', 'Learn more'],
  ['Pages', 'explore', 'Explore %s'],
  ['Pages', 'discover', 'Discover %s'],
  ['Pages', 'visitWebsite', 'Visit website'],
  ['Pages', 'overview', 'Overview'],
  ['Pages', 'features', 'Features'],
  ['Pages', 'howItWorks', 'How it works'],
  ['Pages', 'integrations', 'Integrations'],
  ['Pages', 'whoItIsFor', 'Who it is for'],
  ['Pages', 'ourProducts', 'Our products'],
  ['Pages', 'whatWeDeliver', 'What we deliver'],
  ['Pages', 'whereWeWork', 'Where we work'],
  ['Pages', 'whyUs', 'Why ASSERT'],
  ['Pages', 'howWeWork', 'How we work'],
  ['Pages', 'whatWeStandFor', 'What we stand for'],
  ['Pages', 'sectorsTitle', 'AI for sectors where decisions carry weight'],
  ['Pages', 'sectorsLead', 'We bring AI to sectors where accuracy, security and accountability are not optional.'],
  ['Pages', 'sectorsCtaTitle', 'Working in another sector?'],
  ['Pages', 'sectorsCtaText', 'Our team also delivers AI for the public sector, legal services, logistics, maritime and more.'],
  ['Pages', 'sectorsCtaLabel', 'Talk to us'],
  ['Pages', 'productsTitle', 'Proven AI platforms, ready to deploy'],
  ['Pages', 'productsLead', 'Each product is built on the same principles: secure, explainable and compliant with European regulation.'],
  ['Pages', 'productsCtaTitle', 'Need something tailored?'],
  ['Pages', 'productsCtaText', 'We also design and build custom AI solutions around your data and processes.'],
  ['Pages', 'productsCtaLabel', 'Talk to us'],
  ['Pages', 'sectorCtaTitle', 'Discuss your %s project'],
  ['Pages', 'sectorCtaText', 'Our team will get back to you within one business day.'],
  ['Pages', 'sectorCtaLabel', 'Talk to our team'],
  ['Pages', 'aboutCtaTitle', 'Work with us'],
  ['Pages', 'aboutCtaText', "Tell us about the decision you need to make, and we'll show you how AI can help."],
  ['Pages', 'aboutCtaLabel', 'Contact us'],
  ['Contact form', 'contactDetails', 'Contact details'],
  ['Contact form', 'map', 'Map'],
  ['Contact form', 'formRequiredNote', 'Fields marked with * are required.'],
  ['Contact form', 'formName', 'Name'],
  ['Contact form', 'formOrganisation', 'Organisation'],
  ['Contact form', 'formEmail', 'Email'],
  ['Contact form', 'formPhone', 'Phone'],
  ['Contact form', 'formSector', 'Sector'],
  ['Contact form', 'formProduct', 'Interested in'],
  ['Contact form', 'formSelect', 'Select…'],
  ['Contact form', 'formMessage', 'Message'],
  ['Contact form', 'formSend', 'Send message'],
  ['Contact form', 'formSending', 'Sending…'],
  ['Contact form', 'formSentTitle', 'Message sent'],
  ['Contact form', 'formSentText', 'Thank you — we will get back to you shortly.'],
  ['Contact form', 'formError', 'Something went wrong. Please try again or email us.'],
  ['Errors', 'notFoundTitle', 'This page could not be found'],
  ['Errors', 'notFoundText', 'The page may have moved. Try one of these instead.'],
  ['Errors', 'goHome', 'Go to the home page'],
  ['Errors', 'contactUs', 'Contact us'],
  ['Errors', 'errorKicker', 'Temporarily unavailable'],
  ['Errors', 'errorTitle', 'Something went wrong'],
  ['Errors', 'errorText', 'Please try again in a moment.'],
  ['Errors', 'tryAgain', 'Try again'],
];

export const STRING_DEFAULTS: Record<string, string> = Object.fromEntries(STRINGS.map(([, k, v]) => [k, v]));

const STRING_FIELDS: Field[] = STRINGS.map(([tab, key, def]) => ({
  key, label: def, type: 'text', tab, placeholder: def,
  help: def.includes('%') ? '%s / %n are replaced automatically (e.g. a name).' : undefined,
}));

const cta = (key: string, label: string): Field => ({
  key,
  label,
  type: 'group',
  fields: [
    { key: 'label', label: 'Button label', type: 'text' },
    { key: 'url', label: 'Link', type: 'url', placeholder: '/contact' },
  ],
});

const titleText = (itemLabel = 'title'): Field[] => [
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'text', label: 'Text', type: 'textarea' },
].map((f) => ({ ...f })) as Field[];

/** Per-page SEO block, reused by every page type. */
export const seoField: Field = {
  key: 'seo',
  label: 'SEO & social sharing',
  type: 'group',
  tab: 'SEO',
  fields: [
    { key: 'title', label: 'Meta title', type: 'text', max: 120, help: 'Shown in Google and browser tabs. ~50–60 characters. Leave empty to use the page title.' },
    { key: 'description', label: 'Meta description', type: 'textarea', max: 320, help: '~140–160 characters summarising the page.' },
    { key: 'keywords', label: 'Keywords', type: 'list', help: 'Optional. One per line.' },
    { key: 'ogImage', label: 'Social share image', type: 'image', help: '1200×630 px recommended. Leave empty to auto-generate.' },
    { key: 'canonical', label: 'Canonical URL', type: 'url', help: 'Only if this content lives at another URL.' },
    { key: 'noindex', label: 'Hide from search engines (noindex)', type: 'boolean' },
  ],
};

export const CONTENT_TYPES: ContentType[] = [
  {
    name: 'home',
    label: 'Home page',
    kind: 'singleton',
    icon: 'home',
    previewPath: '/',
    fields: [
      {
        key: 'hero', label: 'Hero', type: 'group', tab: 'Hero', fields: [
          { key: 'eyebrow', label: 'Eyebrow (small text above headline)', type: 'text' },
          { key: 'headline', label: 'Headline', type: 'text', required: true },
          { key: 'subheadline', label: 'Subheadline', type: 'textarea' },
          { key: 'image', label: 'Background image', type: 'image', help: 'Wide photo, at least 1600 px. Shown behind the headline with a dark overlay.' },
          cta('primaryCta', 'Primary button'),
          cta('secondaryCta', 'Secondary button'),
        ],
      },
      {
        key: 'intro', label: 'Introduction', type: 'group', tab: 'Content', fields: [
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'text', label: 'Text', type: 'markdown' },
        ],
      },
      { key: 'stats', label: 'Trust figures', type: 'repeater', tab: 'Content', itemLabel: 'label', fields: [
        { key: 'value', label: 'Value', type: 'text', placeholder: '25+' },
        { key: 'label', label: 'Label', type: 'text', placeholder: 'Projects delivered' },
      ] },
      { key: 'sectorsTitle', label: 'Sectors section title', type: 'text', tab: 'Content' },
      { key: 'sectorsIntro', label: 'Sectors section intro', type: 'textarea', tab: 'Content' },
      { key: 'productsTitle', label: 'Products section title', type: 'text', tab: 'Content' },
      { key: 'productsIntro', label: 'Products section intro', type: 'textarea', tab: 'Content' },
      { key: 'whyTitle', label: '"Why ASSERT" title', type: 'text', tab: 'Content' },
      { key: 'why', label: '"Why ASSERT" points', type: 'repeater', tab: 'Content', itemLabel: 'title', fields: titleText() },
      { key: 'processTitle', label: 'Process title', type: 'text', tab: 'Content' },
      { key: 'process', label: 'Process steps', type: 'repeater', tab: 'Content', itemLabel: 'title', fields: titleText() },
      {
        key: 'cta', label: 'Closing call to action', type: 'group', tab: 'Content', fields: [
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'text', label: 'Text', type: 'textarea' },
          { key: 'label', label: 'Button label', type: 'text' },
          { key: 'url', label: 'Button link', type: 'url' },
        ],
      },
      seoField,
    ],
  },
  {
    name: 'about',
    label: 'About page',
    kind: 'singleton',
    icon: 'info',
    previewPath: '/about',
    fields: [
      { key: 'title', label: 'Page title', type: 'text', required: true },
      { key: 'headline', label: 'Headline', type: 'text' },
      { key: 'intro', label: 'Introduction', type: 'markdown' },
      { key: 'missionTitle', label: 'Mission title', type: 'text' },
      { key: 'mission', label: 'Mission statement', type: 'textarea' },
      { key: 'valuesTitle', label: 'Values title', type: 'text' },
      { key: 'values', label: 'Values', type: 'repeater', itemLabel: 'title', fields: titleText() },
      { key: 'image', label: 'Image', type: 'image' },
      seoField,
    ],
  },
  {
    name: 'contact',
    label: 'Contact page',
    kind: 'singleton',
    icon: 'mail',
    previewPath: '/contact',
    fields: [
      { key: 'title', label: 'Page title', type: 'text', required: true },
      { key: 'headline', label: 'Headline', type: 'text' },
      { key: 'intro', label: 'Introduction', type: 'textarea' },
      { key: 'sectorOptions', label: 'Form: sector options', type: 'list' },
      { key: 'productOptions', label: 'Form: product options', type: 'list' },
      { key: 'consentText', label: 'Form: consent text', type: 'textarea' },
      { key: 'successMessage', label: 'Form: success message', type: 'textarea' },
      seoField,
    ],
  },
  {
    name: 'sectors',
    label: 'Sectors',
    kind: 'collection',
    icon: 'grid',
    titleField: 'name',
    previewPath: '/sectors/:slug',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'slug', label: 'URL slug', type: 'slug', required: true, help: 'Lowercase letters, numbers and dashes. Used in /sectors/<slug>.' },
      { key: 'published', label: 'Published', type: 'boolean' },
      { key: 'featured', label: 'Highlight on home page', type: 'boolean' },
      { key: 'order', label: 'Sort order', type: 'number' },
      { key: 'icon', label: 'Icon', type: 'select', options: ICONS },
      { key: 'headline', label: 'Headline', type: 'text' },
      { key: 'summary', label: 'Short summary (cards)', type: 'textarea', max: 300 },
      { key: 'intro', label: 'Introduction', type: 'markdown' },
      { key: 'capabilitiesTitle', label: 'Capabilities title', type: 'text' },
      { key: 'capabilities', label: 'Capabilities', type: 'repeater', itemLabel: 'title', fields: titleText() },
      { key: 'image', label: 'Image', type: 'image' },
      seoField,
    ],
  },
  {
    name: 'products',
    label: 'Products',
    kind: 'collection',
    icon: 'box',
    titleField: 'name',
    previewPath: '/products/:slug',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'slug', label: 'URL slug', type: 'slug', required: true },
      { key: 'published', label: 'Published', type: 'boolean' },
      { key: 'order', label: 'Sort order', type: 'number' },
      { key: 'icon', label: 'Icon', type: 'select', options: ICONS },
      { key: 'logo', label: 'Product logo', type: 'image' },
      { key: 'image', label: 'Cover image', type: 'image', help: 'Shown on product cards and as the page header background.' },
      { key: 'category', label: 'Category label', type: 'text', placeholder: 'Defense · Platform' },
      { key: 'tagline', label: 'Tagline', type: 'text' },
      { key: 'summary', label: 'Short summary (cards)', type: 'textarea', max: 300 },
      { key: 'description', label: 'Description', type: 'markdown' },
      { key: 'featuresTitle', label: 'Features title', type: 'text', tab: 'Details' },
      { key: 'features', label: 'Features', type: 'repeater', tab: 'Details', itemLabel: 'title', fields: titleText() },
      { key: 'stepsTitle', label: 'How it works – title', type: 'text', tab: 'Details' },
      { key: 'steps', label: 'How it works – steps', type: 'repeater', tab: 'Details', itemLabel: 'title', fields: titleText() },
      { key: 'integrationsTitle', label: 'Integrations title', type: 'text', tab: 'Details' },
      { key: 'integrations', label: 'Integrations', type: 'repeater', tab: 'Details', itemLabel: 'group', fields: [
        { key: 'group', label: 'Group', type: 'text', placeholder: 'Greece' },
        { key: 'items', label: 'Systems', type: 'list' },
      ] },
      { key: 'audienceTitle', label: 'Audience title', type: 'text', tab: 'Details' },
      { key: 'audience', label: 'Who it is for', type: 'list', tab: 'Details' },
      { key: 'highlights', label: 'Key messages', type: 'list', tab: 'Details' },
      { key: 'cta', label: 'Call to action', type: 'group', tab: 'Details', fields: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'text', label: 'Text', type: 'textarea' },
        { key: 'label', label: 'Button label', type: 'text' },
        { key: 'url', label: 'Button link', type: 'url' },
      ] },
      { key: 'externalUrl', label: 'Product website', type: 'url', tab: 'Details' },
      seoField,
    ],
  },
  {
    name: 'pages',
    label: 'Pages',
    kind: 'collection',
    icon: 'file',
    titleField: 'title',
    previewPath: '/:slug',
    description: 'Free-form pages such as Privacy Policy or Terms.',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'slug', label: 'URL slug', type: 'slug', required: true },
      { key: 'published', label: 'Published', type: 'boolean' },
      { key: 'showInFooter', label: 'Link in footer', type: 'boolean' },
      { key: 'order', label: 'Sort order', type: 'number' },
      { key: 'eyebrow', label: 'Small text above the title', type: 'text', tab: 'Header' },
      { key: 'intro', label: 'Introduction (below the title)', type: 'textarea', tab: 'Header' },
      { key: 'heroImage', label: 'Header background image', type: 'image', tab: 'Header' },
      { ...cta('primaryCta', 'Primary button'), tab: 'Header' },
      { ...cta('secondaryCta', 'Secondary button'), tab: 'Header' },
      { key: 'body', label: 'Main text', type: 'markdown', help: 'Optional. Shown first, before the sections.' },
      {
        key: 'sections', label: 'Sections', type: 'repeater', tab: 'Sections', itemLabel: 'title',
        help: 'Build the page from blocks. Use the arrows to change their order.',
        fields: [
          { key: 'type', label: 'Section type', type: 'select', options: SECTION_TYPES },
          { key: 'background', label: 'Background', type: 'select', options: [
            { value: 'light', label: 'White' }, { value: 'alt', label: 'Light grey' }, { value: 'dark', label: 'Dark (brand colour)' },
          ] },
          { key: 'eyebrow', label: 'Small text above the title', type: 'text' },
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'intro', label: 'Introduction', type: 'textarea' },
          { key: 'text', label: 'Text', type: 'markdown', when: ['text', 'textImage'] },
          { key: 'image', label: 'Image', type: 'image', when: ['textImage', 'image'] },
          { key: 'imageAlt', label: 'Image description (alt text)', type: 'text', when: ['textImage', 'image'], help: 'Describe the image for people who cannot see it. Leave empty if it is purely decorative.' },
          { key: 'imagePosition', label: 'Image position', type: 'select', when: ['textImage'], options: [
            { value: 'right', label: 'Right of the text' }, { value: 'left', label: 'Left of the text' },
          ] },
          { key: 'items', label: 'Items', type: 'repeater', itemLabel: 'title', when: ['features', 'cards', 'steps', 'stats'],
            help: 'For "Figures": Title = the number (e.g. 25+), Text = what it means.',
            fields: [
              { key: 'title', label: 'Title', type: 'text' },
              { key: 'text', label: 'Text', type: 'textarea' },
              { key: 'icon', label: 'Icon (numbered cards only)', type: 'select', options: ICONS },
            ] },
          { key: 'buttonLabel', label: 'Button label', type: 'text', when: ['text', 'textImage', 'cta', 'sectors', 'products'] },
          { key: 'buttonUrl', label: 'Button link', type: 'url', when: ['text', 'textImage', 'cta', 'sectors', 'products'], placeholder: '/contact' },
        ],
      },
      seoField,
    ],
  },
  {
    name: 'settings',
    label: 'Site & SEO settings',
    kind: 'singleton',
    icon: 'settings',
    fields: [
      // General
      { key: 'siteName', label: 'Site name', type: 'text', required: true, tab: 'General' },
      { key: 'siteUrl', label: 'Public site URL', type: 'url', tab: 'General', noTranslate: true, help: 'e.g. https://assert.gr – used for canonical URLs, sitemap and social cards.' },
      { key: 'tagline', label: 'Tagline', type: 'text', tab: 'General' },
      { key: 'logo', label: 'Logo (for dark backgrounds)', type: 'image', tab: 'General', noTranslate: true, help: 'Leave empty to use the built-in white logo.' },
      { key: 'logoDark', label: 'Logo (for light backgrounds)', type: 'image', tab: 'General', noTranslate: true },
      { key: 'primaryColor', label: 'Primary colour', type: 'color', tab: 'General' },
      { key: 'accentColor', label: 'Accent colour', type: 'color', tab: 'General' },
      { key: 'headerCta', label: 'Header button', type: 'group', tab: 'General', fields: [
        { key: 'label', label: 'Label', type: 'text' },
        { key: 'url', label: 'Link', type: 'url' },
      ] },
      { key: 'footerText', label: 'Footer text', type: 'textarea', tab: 'General' },
      { key: 'announcement', label: 'Announcement bar (optional)', type: 'text', tab: 'General' },
      // Contact & social
      { key: 'contact', label: 'Contact details', type: 'group', tab: 'Contact & social', noTranslate: true, fields: [
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'phone', label: 'Phone', type: 'text' },
        { key: 'street', label: 'Street address', type: 'text' },
        { key: 'city', label: 'City', type: 'text' },
        { key: 'postalCode', label: 'Postal code', type: 'text' },
        { key: 'country', label: 'Country code', type: 'text', placeholder: 'GR' },
        { key: 'mapUrl', label: 'Map link', type: 'url' },
      ] },
      { key: 'socialLinks', label: 'Social media buttons', type: 'repeater', tab: 'Contact & social', itemLabel: 'network', noTranslate: true,
        help: 'Add, remove and reorder your social profiles. Rows without a link are not shown on the website.',
        fields: [
          { key: 'network', label: 'Network', type: 'select', options: SOCIAL_NETWORKS },
          { key: 'url', label: 'Profile link', type: 'url', placeholder: 'https://www.linkedin.com/company/…' },
          { key: 'label', label: 'Name (optional)', type: 'text', help: 'Only needed for "Other website", e.g. "Our blog".' },
        ] },
      { key: 'showSocialInFooter', label: 'Show social buttons in the footer', type: 'boolean', tab: 'Contact & social' },
      { key: 'showSocialOnContact', label: 'Show social buttons on the contact page', type: 'boolean', tab: 'Contact & social' },
      // SEO
      { key: 'seo', label: 'Search engine defaults', type: 'group', tab: 'SEO', fields: [
        { key: 'defaultTitle', label: 'Default title (home page)', type: 'text', max: 120 },
        { key: 'titleTemplate', label: 'Title template', type: 'text', help: '%s is replaced by the page title, e.g. "%s | ASSERT".' },
        { key: 'defaultDescription', label: 'Default meta description', type: 'textarea', max: 320 },
        { key: 'keywords', label: 'Default keywords', type: 'list' },
        { key: 'defaultOgImage', label: 'Default social share image', type: 'image', help: '1200×630 px. Leave empty to auto-generate branded images.' },
        { key: 'locale', label: 'Locale', type: 'select', options: [
          { value: 'en_US', label: 'English (en_US)' }, { value: 'en_GB', label: 'English (en_GB)' }, { value: 'el_GR', label: 'Greek (el_GR)' },
        ] },
        { key: 'twitterHandle', label: 'X / Twitter handle', type: 'text', placeholder: '@assert_ai' },
        { key: 'allowIndexing', label: 'Allow search engines to index the site', type: 'boolean', help: 'Turn off on staging sites.' },
        { key: 'robotsDisallow', label: 'robots.txt – extra disallowed paths', type: 'list', placeholder: '/private' },
      ] },
      { key: 'verification', label: 'Search console verification', type: 'group', tab: 'SEO', noTranslate: true, fields: [
        { key: 'google', label: 'Google Search Console code', type: 'text' },
        { key: 'bing', label: 'Bing Webmaster code', type: 'text' },
        { key: 'yandex', label: 'Yandex code', type: 'text' },
      ] },
      { key: 'organization', label: 'Organisation (structured data)', type: 'group', tab: 'SEO', fields: [
        { key: 'legalName', label: 'Legal name', type: 'text' },
        { key: 'foundingYear', label: 'Founding year', type: 'text' },
        { key: 'vatId', label: 'VAT number', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ] },
      { key: 'redirects', label: 'Redirects', type: 'repeater', tab: 'SEO', itemLabel: 'from', noTranslate: true, help: 'Redirect old URLs (e.g. from the previous site) to new pages.', fields: [
        { key: 'from', label: 'From path', type: 'text', placeholder: '/old-page' },
        { key: 'to', label: 'To path or URL', type: 'text', placeholder: '/new-page' },
        { key: 'permanent', label: 'Permanent (301)', type: 'boolean' },
      ] },
      // Analytics
      { key: 'analytics', label: 'Analytics & tracking', type: 'group', tab: 'Analytics', noTranslate: true, help: 'Google Analytics and Tag Manager load only after the visitor accepts analytics cookies (Plausible is cookie-free and always loads).', fields: [
        { key: 'gaMeasurementId', label: 'Google Analytics 4 ID', type: 'text', placeholder: 'G-XXXXXXXXXX' },
        { key: 'gtmId', label: 'Google Tag Manager ID', type: 'text', placeholder: 'GTM-XXXXXXX' },
        { key: 'plausibleDomain', label: 'Plausible domain', type: 'text', placeholder: 'assert.gr' },
      ] },
      // Cookies
      { key: 'cookies', label: 'Cookie consent banner', type: 'group', tab: 'Cookies', fields: [
        { key: 'enabled', label: 'Show the cookie banner', type: 'boolean' },
        { key: 'title', label: 'Title', type: 'text', placeholder: 'Your privacy' },
        { key: 'text', label: 'Text', type: 'textarea' },
        { key: 'acceptLabel', label: '"Accept all" button', type: 'text', placeholder: 'Accept all' },
        { key: 'rejectLabel', label: '"Reject" button', type: 'text', placeholder: 'Necessary only' },
        { key: 'customizeLabel', label: '"Settings" button', type: 'text', placeholder: 'Cookie settings' },
        { key: 'saveLabel', label: '"Save" button', type: 'text', placeholder: 'Save choices' },
        { key: 'policyLabel', label: 'Policy link text', type: 'text', placeholder: 'Privacy policy' },
        { key: 'policyUrl', label: 'Policy link', type: 'url', placeholder: '/privacy' },
        { key: 'necessaryTitle', label: 'Necessary cookies – title', type: 'text' },
        { key: 'necessaryText', label: 'Necessary cookies – description', type: 'textarea' },
        { key: 'analyticsTitle', label: 'Analytics cookies – title', type: 'text' },
        { key: 'analyticsText', label: 'Analytics cookies – description', type: 'textarea' },
      ] },
      // Languages
      { key: 'languages', label: 'Languages', type: 'repeater', tab: 'Languages', itemLabel: 'name', noTranslate: true,
        help: 'The FIRST language is the default and has no prefix in the URL (/about). Other enabled languages are served under their code (/el/about). Untranslated texts fall back to the default language. After adding a language, save, reload the admin and use the language tabs on each page to translate.',
        fields: [
          { key: 'code', label: 'Code', type: 'text', placeholder: 'el', help: 'Two letters (ISO 639-1), e.g. en, el, de, fr.' },
          { key: 'name', label: 'Name (in that language)', type: 'text', placeholder: 'Ελληνικά' },
          { key: 'locale', label: 'Locale', type: 'text', placeholder: 'el_GR', help: 'Used for social sharing, e.g. en_US, el_GR, de_DE.' },
          { key: 'enabled', label: 'Visible on the website', type: 'boolean' },
        ] },
    ],
  },
  {
    name: 'navigation',
    label: 'Menus',
    kind: 'singleton',
    icon: 'menu',
    description: 'Header and footer menus. Use the arrows on each item to change the order.',
    fields: [
      { key: 'header', label: 'Header menu', type: 'repeater', tab: 'Header', itemLabel: 'label', fields: [
        { key: 'label', label: 'Label', type: 'text' },
        { key: 'kind', label: 'Type', type: 'select', options: MENU_KINDS },
        { key: 'url', label: 'Link', type: 'url', placeholder: '/about', help: 'For dropdowns this is where the label itself links to.' },
        { key: 'newTab', label: 'Open in a new tab', type: 'boolean' },
      ] },
      { key: 'footer', label: 'Footer columns', type: 'repeater', tab: 'Footer', itemLabel: 'title', fields: [
        { key: 'title', label: 'Column title', type: 'text' },
        { key: 'kind', label: 'Content', type: 'select', options: [
          { value: 'links', label: 'Links (below)' },
          { value: 'sectors', label: 'All sectors' },
          { value: 'products', label: 'All products' },
          { value: 'contact', label: 'Contact details + links (below)' },
        ] },
        { key: 'links', label: 'Links', type: 'repeater', itemLabel: 'label', when: ['links', 'contact'], fields: [
          { key: 'label', label: 'Label', type: 'text' },
          { key: 'url', label: 'Link', type: 'url' },
          { key: 'newTab', label: 'Open in a new tab', type: 'boolean' },
        ] },
      ] },
      { key: 'legal', label: 'Bottom bar links', type: 'repeater', tab: 'Footer', itemLabel: 'label', help: 'Small links at the very bottom (e.g. Terms). Pages marked "Link in footer" are added automatically.', fields: [
        { key: 'label', label: 'Label', type: 'text' },
        { key: 'url', label: 'Link', type: 'url' },
      ] },
    ],
  },
  {
    name: 'strings',
    label: 'Interface texts',
    kind: 'singleton',
    icon: 'text',
    description: 'Fixed texts of the website (buttons, labels, messages). Empty fields use the English default shown in grey. Translate them with the language tabs.',
    fields: STRING_FIELDS,
  },
];

export const TYPES = new Map(CONTENT_TYPES.map((t) => [t.name, t]));

/* ------------------------------------------------------------------ */
/* Translations                                                        */
/* ------------------------------------------------------------------ */

const LOCKED_TYPES: FieldType[] = ['slug', 'boolean', 'number', 'select', 'color'];

export function isTranslatable(f: Field): boolean {
  return !f.noTranslate && !LOCKED_TYPES.includes(f.type);
}

/** Only the translatable part of a field list (recursively). */
export function translatableFields(fields: Field[]): Field[] {
  return fields
    .filter(isTranslatable)
    .map((f) => (f.fields ? { ...f, fields: translatableFields(f.fields), required: false } : { ...f, required: false }));
}

export const isEmpty = (v: unknown): boolean =>
  v === undefined || v === null || v === '' ||
  (Array.isArray(v) && v.every(isEmpty)) ||
  (typeof v === 'object' && !Array.isArray(v) && Object.values(v as object).every(isEmpty));

/** Removes empty values from a translation. Arrays keep their positions (items align by index). */
function prune(v: unknown): unknown {
  if (Array.isArray(v)) return isEmpty(v) ? undefined : v.map((x) => prune(x) ?? {});
  if (v && typeof v === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v)) {
      const p = prune(x);
      if (!isEmpty(p)) out[k] = p;
    }
    return out;
  }
  return isEmpty(v) ? undefined : v;
}

/** Cleans `translations` ({ el: {...}, de: {...} }) against the schema; drops empty languages. */
export function sanitizeTranslations(fields: Field[], input: unknown, codes: string[]): Record<string, unknown> | undefined {
  if (!input || typeof input !== 'object') return undefined;
  const tf = translatableFields(fields);
  const out: Record<string, unknown> = {};
  for (const code of codes) {
    const v = (input as Record<string, unknown>)[code];
    if (!v) continue;
    const clean = prune(sanitizeObject(tf, v));
    if (!isEmpty(clean)) out[code] = clean;
  }
  return Object.keys(out).length ? out : undefined;
}

/** Overlays a translation on the default-language data. Empty translated values fall back. */
export function mergeTranslation(fields: Field[], base: Record<string, unknown>, tr: unknown): Record<string, unknown> {
  if (!tr || typeof tr !== 'object') return base;
  const t = tr as Record<string, unknown>;
  const out: Record<string, unknown> = { ...base };
  for (const f of fields) {
    if (!isTranslatable(f) || isEmpty(t[f.key])) continue;
    const b = base[f.key];
    if (f.type === 'group') {
      out[f.key] = mergeTranslation(f.fields || [], (b as Record<string, unknown>) || {}, t[f.key]);
    } else if (f.type === 'repeater') {
      const arr = Array.isArray(b) ? b : [];
      const tarr = Array.isArray(t[f.key]) ? (t[f.key] as unknown[]) : [];
      out[f.key] = arr.map((item, i) => mergeTranslation(f.fields || [], item as Record<string, unknown>, tarr[i]));
    } else {
      out[f.key] = t[f.key];
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Sanitising                                                          */
/* ------------------------------------------------------------------ */

const MAX_TEXT = 50_000;

function str(v: unknown, max = MAX_TEXT): string {
  if (v === null || v === undefined) return '';
  return String(v).slice(0, max);
}

function safeUrl(v: unknown): string {
  const s = str(v, 2000).trim();
  if (!s) return '';
  if (/^(javascript|data|vbscript):/i.test(s)) return '';
  return s;
}

export function sanitizeField(field: Field, value: unknown): unknown {
  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'markdown':
      return str(value, field.max ?? MAX_TEXT);
    case 'email':
      return str(value, 254).trim();
    case 'url':
    case 'image':
      return safeUrl(value);
    case 'color': {
      const s = str(value, 20).trim();
      return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s) ? s : '';
    }
    case 'number': {
      const n = Number(value);
      return Number.isFinite(n) ? n : 0;
    }
    case 'boolean':
      return value === true || value === 'true' || value === 1 || value === 'on';
    case 'select': {
      const s = str(value, 200);
      return field.options?.some((o) => o.value === s) ? s : '';
    }
    case 'slug':
      return str(value, 120)
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    case 'list':
      return (Array.isArray(value) ? value : [])
        .map((v) => str(v, 2000).trim())
        .filter(Boolean)
        .slice(0, 500);
    case 'group':
      return sanitizeObject(field.fields || [], value);
    case 'repeater':
      return (Array.isArray(value) ? value : []).slice(0, 500).map((item) => sanitizeObject(field.fields || [], item));
    default:
      return undefined;
  }
}

export function sanitizeObject(fields: Field[], input: unknown): Record<string, unknown> {
  const src = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const out: Record<string, unknown> = {};
  for (const f of fields) out[f.key] = sanitizeField(f, src[f.key]);
  return out;
}

export function missingRequired(fields: Field[], data: Record<string, unknown>): string[] {
  return fields.filter((f) => f.required && !data[f.key]).map((f) => f.label);
}
