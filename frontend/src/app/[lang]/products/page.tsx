import Link from 'next/link';
import type { Metadata } from 'next';
import { getProducts, mediaUrl, siteUrl } from '@/lib/cms';
import { getI18n } from '@/lib/i18n';
import { breadcrumbLd, graph, pageMetadata } from '@/lib/seo';
import { PageHero } from '@/components/PageHero';
import { Icon } from '@/components/Icon';
import { JsonLd } from '@/components/JsonLd';
import { CtaBand } from '@/components/CtaBand';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return pageMetadata({ path: '/products', title: t('products'), description: t('productsLead'), kicker: t('products') });
}

export default async function ProductsPage() {
  const { lang, t, href, prefix } = await getI18n();
  const [products, base] = await Promise.all([getProducts(lang), siteUrl()]);
  const crumbs = [{ name: t('home'), path: '/' }, { name: t('products'), path: '/products' }];
  return (
    <>
      <JsonLd data={graph(breadcrumbLd(base + prefix, crumbs), {
        '@type': 'ItemList',
        itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${base}${prefix}/products/${p.slug}`, name: p.name })),
      })} />
      <PageHero kicker={t('products')} title={t('productsTitle')} lead={t('productsLead')} crumbs={crumbs} />
      <section className="section">
        <div className="container product-list">
          {products.map((p, i) => (
            <article key={p.slug} className={`product-row${i % 2 ? ' reverse' : ''}`} aria-labelledby={`p-${p.slug}`}>
              <div className={`product-row-visual dark${p.image ? ' has-photo' : ''}`} aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.image ? <img className="hero-photo" src={mediaUrl(p.image)} alt="" loading="lazy" /> : null}
                <Icon name={p.icon} size={64} />
                <span>{p.name}</span>
              </div>
              <div className="product-row-copy">
                {p.category ? <p className="eyebrow">{p.category}</p> : null}
                <h2 id={`p-${p.slug}`}>{p.name}</h2>
                {p.tagline ? <p className="product-tagline">{p.tagline}</p> : null}
                <p>{p.summary}</p>
                <Link href={href(`/products/${p.slug}`)} className="btn btn-primary">{t('discover', p.name || '')} <Icon name="arrow" size={16} /></Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <CtaBand title={t('productsCtaTitle')} text={t('productsCtaText')} label={t('productsCtaLabel')} url="/contact" />
    </>
  );
}
