import Link from 'next/link';
import type { Metadata } from 'next';
import { getHome, mediaUrl } from '@/lib/cms';
import { getI18n } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import { CircuitArt, NodeGrid } from '@/components/CircuitArt';
import { Icon } from '@/components/Icon';
import { Markdown } from '@/components/Markdown';
import { SmartLink } from '@/components/SmartLink';
import { CtaBand } from '@/components/CtaBand';
import { HeroDecor } from '@/components/HeroDecor';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { lang } = await getI18n();
  const home = await getHome(lang);
  return pageMetadata({ path: '/', seo: home.seo, isHome: true, description: home.hero?.subheadline });
}

export default async function HomePage() {
  const { lang, t, href } = await getI18n();
  const home = await getHome(lang);
  const hero = home.hero || {};
  const sectors = (home.sectors || []).filter((s) => s.featured !== false);
  const products = home.products || [];
  const heroPhoto = mediaUrl(hero.image);

  return (
    <>
      <section className={`hero dark${heroPhoto ? ' has-photo' : ''}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {heroPhoto ? <img className="hero-photo" src={heroPhoto} alt="" fetchPriority="high" /> : null}
        <NodeGrid />
        <HeroDecor />
        <div className="container hero-grid">
          <div className="hero-copy">
            {hero.eyebrow ? <p className="eyebrow">{hero.eyebrow}</p> : null}
            <h1 className="hero-title">{hero.headline || 'ASSERT'}</h1>
            {hero.subheadline ? <p className="lead">{hero.subheadline}</p> : null}
            <div className="hero-actions">
              {hero.primaryCta?.label ? (
                <SmartLink href={hero.primaryCta.url} className="btn btn-accent btn-lg">
                  {hero.primaryCta.label} <Icon name="arrow" size={18} />
                </SmartLink>
              ) : null}
              {hero.secondaryCta?.label ? (
                <SmartLink href={hero.secondaryCta.url} className="btn btn-ghost btn-lg">{hero.secondaryCta.label}</SmartLink>
              ) : null}
            </div>
          </div>
          <CircuitArt className="hero-art" />
        </div>
        {home.stats?.length ? (
          <div className="container">
            <dl className="stats">
              {home.stats.map((s, i) => (
                <div key={i}>
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </section>

      {home.intro?.title || home.intro?.text ? (
        <section className="section">
          <div className="container split">
            <h2 className="section-title">{home.intro?.title}</h2>
            <Markdown className="prose lead-prose">{home.intro?.text}</Markdown>
          </div>
        </section>
      ) : null}

      {sectors.length ? (
        <section className="section section-alt" aria-labelledby="sectors-title">
          <div className="container">
            <header className="section-head">
              <p className="eyebrow">{t('sectors')}</p>
              <h2 id="sectors-title" className="section-title">{home.sectorsTitle || t('whereWeWork')}</h2>
              {home.sectorsIntro ? <p className="section-lead">{home.sectorsIntro}</p> : null}
            </header>
            <div className="card-grid four">
              {sectors.map((s) => (
                <Link key={s.slug} href={href(`/sectors/${s.slug}`)} className="card sector-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {s.image ? <img className="card-media" src={mediaUrl(s.image)} alt="" loading="lazy" /> : null}
                  <span className="card-icon"><Icon name={s.icon} size={28} /></span>
                  <h3>{s.name}</h3>
                  <p>{s.summary}</p>
                  <span className="card-more">{t('learnMore')} <Icon name="arrow" size={16} /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {products.length ? (
        <section className="section" aria-labelledby="products-title">
          <div className="container">
            <header className="section-head">
              <p className="eyebrow">{t('products')}</p>
              <h2 id="products-title" className="section-title">{home.productsTitle || t('ourProducts')}</h2>
              {home.productsIntro ? <p className="section-lead">{home.productsIntro}</p> : null}
            </header>
            <div className="card-grid three">
              {products.map((p) => (
                <Link key={p.slug} href={href(`/products/${p.slug}`)} className="card product-card dark">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.image ? <img className="card-media" src={mediaUrl(p.image)} alt="" loading="lazy" /> : null}
                  <div className="product-card-top">
                    <span className="card-icon"><Icon name={p.icon} size={28} /></span>
                    {p.category ? <span className="tag">{p.category}</span> : null}
                  </div>
                  <h3>{p.name}</h3>
                  {p.tagline ? <p className="product-tagline">{p.tagline}</p> : null}
                  <p>{p.summary}</p>
                  <span className="card-more">{t('discover', p.name || '')} <Icon name="arrow" size={16} /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {home.why?.length ? (
        <section className="section section-alt" aria-labelledby="why-title">
          <div className="container">
            <header className="section-head">
              <h2 id="why-title" className="section-title">{home.whyTitle || t('whyUs')}</h2>
            </header>
            <ul className="feature-grid">
              {home.why.map((w, i) => (
                <li key={i}>
                  <span className="check"><Icon name="check" size={18} /></span>
                  <div>
                    <h3>{w.title}</h3>
                    <p>{w.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {home.process?.length ? (
        <section className="section" aria-labelledby="process-title">
          <div className="container">
            <header className="section-head">
              <h2 id="process-title" className="section-title">{home.processTitle || t('howWeWork')}</h2>
            </header>
            <ol className="steps">
              {home.process.map((p, i) => (
                <li key={i}>
                  <span className="step-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      <CtaBand {...(home.cta || {})} />
    </>
  );
}
