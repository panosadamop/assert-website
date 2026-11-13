import { getProducts, getSectors, getSite, siteUrl } from '@/lib/cms';

export const revalidate = 300;

/** /llms.txt – a plain-text summary of the site for AI assistants and answer engines. */
export async function GET() {
  const [{ settings }, sectors, products, base] = await Promise.all([getSite(), getSectors(), getProducts(), siteUrl()]);
  const lines = [
    `# ${settings.siteName || 'ASSERT'}`,
    '',
    `> ${settings.seo?.defaultDescription || settings.tagline || ''}`,
    '',
    '## Sectors',
    ...sectors.map((s) => `- [${s.name}](${base}/sectors/${s.slug}): ${s.summary || ''}`),
    '',
    '## Products',
    ...products.map((p) => `- [${p.name}](${base}/products/${p.slug}): ${p.summary || ''}`),
    '',
    '## Company',
    `- [About](${base}/about)`,
    `- [Contact](${base}/contact)${settings.contact?.email ? ` – ${settings.contact.email}` : ''}`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
