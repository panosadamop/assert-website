import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct, getProducts, siteUrl } from '@/lib/cms';
import { getI18n } from '@/lib/i18n';
import { absolute, breadcrumbLd, graph, pageMetadata } from '@/lib/seo';
import { PageHero } from '@/components/PageHero';
import { Markdown } from '@/components/Markdown';
import { Icon } from '@/components/Icon';
import { JsonLd } from '@/components/JsonLd';
import { CtaBand } from '@/components/CtaBand';
import { SmartLink } from '@/components/SmartLink';

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { lang, t } = await getI18n();
  const p = await getProduct(slug, lang);
  if (!p) return {};
  return pageMetadata({ path: `/products/${slug}`, title: p.name, description: p.summary, seo: p.seo, kicker: p.category || t('products') });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const { lang, t, site, prefix } = await getI18n();
  const [p, base] = await Promise.all([getProduct(slug, lang), siteUrl()]);
  if (!p) notFound();
  const crumbs = [{ name: t('home'), path: '/' }, { name: t('products'), path: '/products' }, { name: p.name || slug, path: `/products/${slug}` }];
  return (
    <>
      <JsonLd data={graph(breadcrumbLd(base + prefix, crumbs), {
        '@type': 'SoftwareApplication',
        name: p.name,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: p.seo?.description || p.summary,
        url: `${base}${prefix}/products/${slug}`,
        inLanguage: lang,
        image: absolute(base, p.logo || p.seo?.ogImage) || undefined,
        sameAs: p.externalUrl || undefined,
        featureList: p.features?.map((f) => f.title).filter(Boolean).join(', ') || undefined,
        audience: p.audience?.length ? { '@type': 'Audience', audienceType: p.audience.join(', ') } : undefined,
        publisher: { '@id': `${base}/#organization` },
        provider: { '@type': 'Organization', name: site.settings.siteName || 'ASSERT', url: base },
      })} />
      <PageHero kicker={p.category || t('products')} title={p.name || ''} lead={p.tagline} crumbs={crumbs} icon={<Icon name={p.icon} size={34} />} image={p.image}>
        <div className="hero-actions">
          {p.cta?.label ? <SmartLink href={p.cta.url} className="btn btn-accent btn-lg">{p.cta.label} <Icon name="arrow" size={18} /></SmartLink> : null}
          {p.externalUrl ? <a href={p.externalUrl} className="btn btn-ghost btn-lg" target="_blank" rel="noopener noreferrer">{t('visitWebsite')} <Icon name="external" size={16} /><span className="sr-only"> {t('opensInNewTab')}</span></a> : null}
        </div>
      </PageHero>

      {p.description ? (
        <section className="section">
          <div className="container split">
            <div>
              <p className="eyebrow">{t('overview')}</p>
              <h2 className="section-title">{p.summary}</h2>
            </div>
            <Markdown className="prose lead-prose">{p.description}</Markdown>
          </div>
        </section>
      ) : null}

      {p.highlights?.length ? (
        <section className="highlights-band dark">
          <div className="container">
            <ul>{p.highlights.map((h, i) => <li key={i}><Icon name="check" size={18} /> {h}</li>)}</ul>
          </div>
        </section>
      ) : null}

      {p.features?.length ? (
        <section className="section section-alt">
          <div className="container">
            <header className="section-head"><h2 className="section-title">{p.featuresTitle || t('features')}</h2></header>
            <div className="card-grid three">
              {p.features.map((f, i) => (
                <div key={i} className="card capability">
                  <span className="cap-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {p.steps?.length ? (
        <section className="section">
          <div className="container">
            <header className="section-head"><h2 className="section-title">{p.stepsTitle || t('howItWorks')}</h2></header>
            <ol className="steps">
              {p.steps.map((s, i) => (
                <li key={i}><span className="step-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><h3>{s.title}</h3><p>{s.text}</p></li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {p.integrations?.length ? (
        <section className="section">
          <div className="container">
            <header className="section-head"><h2 className="section-title">{p.integrationsTitle || t('integrations')}</h2></header>
            <div className="card-grid two">
              {p.integrations.map((g, i) => (
                <div key={i} className="card integration">
                  <h3>{g.group}</h3>
                  <ul className="chips">{(g.items || []).map((it) => <li key={it}>{it}</li>)}</ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {p.audience?.length ? (
        <section className="section section-alt">
          <div className="container split">
            <h2 className="section-title">{p.audienceTitle || t('whoItIsFor')}</h2>
            <ul className="audience">{p.audience.map((a) => <li key={a}><Icon name="check" size={18} /> {a}</li>)}</ul>
          </div>
        </section>
      ) : null}

      <CtaBand {...(p.cta || {})} />
    </>
  );
}
