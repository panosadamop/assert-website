import Link from 'next/link';
import type { Metadata } from 'next';
import { getSectors, mediaUrl, siteUrl } from '@/lib/cms';
import { getI18n } from '@/lib/i18n';
import { breadcrumbLd, graph, pageMetadata } from '@/lib/seo';
import { PageHero } from '@/components/PageHero';
import { Icon } from '@/components/Icon';
import { JsonLd } from '@/components/JsonLd';
import { CtaBand } from '@/components/CtaBand';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return pageMetadata({ path: '/sectors', title: t('sectors'), description: t('sectorsLead'), kicker: t('sectors') });
}

export default async function SectorsPage() {
  const { lang, t, href, prefix } = await getI18n();
  const [sectors, base] = await Promise.all([getSectors(lang), siteUrl()]);
  const crumbs = [{ name: t('home'), path: '/' }, { name: t('sectors'), path: '/sectors' }];
  return (
    <>
      <JsonLd data={graph(breadcrumbLd(base + prefix, crumbs), {
        '@type': 'ItemList',
        itemListElement: sectors.map((s, i) => ({ '@type': 'ListItem', position: i + 1, url: `${base}${prefix}/sectors/${s.slug}`, name: s.name })),
      })} />
      <PageHero kicker={t('sectors')} title={t('sectorsTitle')} lead={t('sectorsLead')} crumbs={crumbs} />
      <section className="section">
        <div className="container">
          <div className="card-grid two">
            {sectors.map((s) => (
              <Link key={s.slug} href={href(`/sectors/${s.slug}`)} className="card sector-card large">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {s.image ? <img className="card-media" src={mediaUrl(s.image)} alt="" loading="lazy" /> : null}
                <span className="card-icon"><Icon name={s.icon} size={30} /></span>
                <h2>{s.name}</h2>
                {s.headline ? <p className="card-headline">{s.headline}</p> : null}
                <p>{s.summary}</p>
                <span className="card-more">{t('explore', s.name || '')} <Icon name="arrow" size={16} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <CtaBand title={t('sectorsCtaTitle')} text={t('sectorsCtaText')} label={t('sectorsCtaLabel')} url="/contact" />
    </>
  );
}
