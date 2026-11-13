import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProducts, getSector, getSectors, siteUrl } from '@/lib/cms';
import { getI18n } from '@/lib/i18n';
import { breadcrumbLd, graph, pageMetadata } from '@/lib/seo';
import { PageHero } from '@/components/PageHero';
import { Markdown } from '@/components/Markdown';
import { Icon } from '@/components/Icon';
import { JsonLd } from '@/components/JsonLd';
import { CtaBand } from '@/components/CtaBand';

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getSectors()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { lang, t } = await getI18n();
  const s = await getSector(slug, lang);
  if (!s) return {};
  return pageMetadata({ path: `/sectors/${slug}`, title: s.name, description: s.summary, seo: s.seo, kicker: t('sectors') });
}

export default async function SectorPage({ params }: Props) {
  const { slug } = await params;
  const { lang, t, href, prefix } = await getI18n();
  const [s, products, base] = await Promise.all([getSector(slug, lang), getProducts(lang), siteUrl()]);
  if (!s) notFound();
  const crumbs = [{ name: t('home'), path: '/' }, { name: t('sectors'), path: '/sectors' }, { name: s.name || slug, path: `/sectors/${slug}` }];
  return (
    <>
      <JsonLd data={graph(breadcrumbLd(base + prefix, crumbs), {
        '@type': 'Service',
        name: s.name,
        serviceType: `${s.name} AI solutions`,
        description: s.seo?.description || s.summary,
        url: `${base}${prefix}/sectors/${slug}`,
        provider: { '@id': `${base}/#organization` },
        areaServed: [{ '@type': 'Country', name: 'Greece' }, { '@type': 'Place', name: 'European Union' }],
      })} />
      <PageHero kicker={s.name} title={s.headline || s.name || ''} lead={s.summary} crumbs={crumbs} icon={<Icon name={s.icon} size={34} />} image={s.image} />
      {s.intro ? (
        <section className="section">
          <div className="container narrow"><Markdown className="prose lead-prose">{s.intro}</Markdown></div>
        </section>
      ) : null}
      {s.capabilities?.length ? (
        <section className="section section-alt">
          <div className="container">
            <header className="section-head"><h2 className="section-title">{s.capabilitiesTitle || t('whatWeDeliver')}</h2></header>
            <div className="card-grid three">
              {s.capabilities.map((c, i) => (
                <div key={i} className="card capability">
                  <span className="cap-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      {products.length ? (
        <section className="section">
          <div className="container">
            <header className="section-head"><h2 className="section-title">{t('ourProducts')}</h2></header>
            <div className="card-grid three">
              {products.map((p) => (
                <Link key={p.slug} href={href(`/products/${p.slug}`)} className="card product-mini">
                  <span className="card-icon"><Icon name={p.icon} size={24} /></span>
                  <div><h3>{p.name}</h3><p>{p.tagline}</p></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <CtaBand title={t('sectorCtaTitle', s.name || '')} text={t('sectorCtaText')} label={t('sectorCtaLabel')} url="/contact" />
    </>
  );
}
