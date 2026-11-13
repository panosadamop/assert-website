import type { Metadata } from 'next';
import { getAbout, mediaUrl, siteUrl } from '@/lib/cms';
import { getI18n } from '@/lib/i18n';
import { breadcrumbLd, graph, pageMetadata } from '@/lib/seo';
import { PageHero } from '@/components/PageHero';
import { Markdown } from '@/components/Markdown';
import { Icon } from '@/components/Icon';
import { JsonLd } from '@/components/JsonLd';
import { CtaBand } from '@/components/CtaBand';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { lang } = await getI18n();
  const a = await getAbout(lang);
  return pageMetadata({ path: '/about', title: a.title || 'About', description: a.headline, seo: a.seo, kicker: a.title || 'About' });
}

export default async function AboutPage() {
  const { lang, t, prefix } = await getI18n();
  const [a, base] = await Promise.all([getAbout(lang), siteUrl()]);
  const crumbs = [{ name: t('home'), path: '/' }, { name: a.title || 'About', path: '/about' }];
  return (
    <>
      <JsonLd data={graph(breadcrumbLd(base + prefix, crumbs), { '@type': 'AboutPage', name: a.title, url: `${base}${prefix}/about`, inLanguage: lang, about: { '@id': `${base}/#organization` } })} />
      <PageHero kicker={a.title || 'About'} title={a.headline || a.title || 'About ASSERT'} crumbs={crumbs} />
      <section className="section">
        <div className="container split">
          <div>
            {a.missionTitle ? <h2 className="eyebrow">{a.missionTitle}</h2> : null}
            {a.mission ? <p className="mission">{a.mission}</p> : null}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {a.image ? <img className="about-photo" src={mediaUrl(a.image)} alt="" loading="lazy" /> : null}
          </div>
          <Markdown className="prose lead-prose">{a.intro}</Markdown>
        </div>
      </section>
      {a.values?.length ? (
        <section className="section section-alt">
          <div className="container">
            <header className="section-head"><h2 className="section-title">{a.valuesTitle || t('whatWeStandFor')}</h2></header>
            <ul className="feature-grid">
              {a.values.map((v, i) => (
                <li key={i}>
                  <span className="check"><Icon name="check" size={18} /></span>
                  <div><h3>{v.title}</h3><p>{v.text}</p></div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
      <CtaBand title={t('aboutCtaTitle')} text={t('aboutCtaText')} label={t('aboutCtaLabel')} url="/contact" />
    </>
  );
}
