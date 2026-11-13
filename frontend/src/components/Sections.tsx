import Link from 'next/link';
import { getProducts, getSectors, mediaUrl } from '@/lib/cms';
import { getI18n } from '@/lib/i18n';
import type { Section } from '@/lib/types';
import { Icon } from './Icon';
import { Markdown } from './Markdown';
import { SmartLink } from './SmartLink';
import { CtaBand } from './CtaBand';
import { ContactBlock } from './ContactBlock';

/** Renders the blocks of a page built in CMS → Pages → Sections. */
export async function Sections({ sections }: { sections?: Section[] }) {
  if (!sections?.length) return null;
  return <>{sections.map((s, i) => <SectionBlock key={i} s={s} index={i} />)}</>;
}

async function SectionBlock({ s, index }: { s: Section; index: number }) {
  const { t, href, lang } = await getI18n();
  const id = `section-${index + 1}`;
  const bg = s.background === 'alt' ? ' section-alt' : s.background === 'dark' ? ' dark section-dark' : '';
  const head = s.title || s.eyebrow || s.intro ? (
    <header className="section-head">
      {s.eyebrow ? <p className="eyebrow">{s.eyebrow}</p> : null}
      {s.title ? <h2 id={id} className="section-title">{s.title}</h2> : null}
      {s.intro ? <p className="section-lead">{s.intro}</p> : null}
    </header>
  ) : null;
  const button = s.buttonLabel ? (
    <p className="section-button">
      <SmartLink href={s.buttonUrl || '/contact'} className={`btn ${s.background === 'dark' ? 'btn-accent' : 'btn-primary'}`}>
        {s.buttonLabel} <Icon name="arrow" size={16} />
      </SmartLink>
    </p>
  ) : null;
  const wrap = (children: React.ReactNode, narrow = false) => (
    <section className={`section${bg}`} aria-labelledby={s.title ? id : undefined}>
      <div className={`container${narrow ? ' narrow' : ''}`}>{children}</div>
    </section>
  );
  const items = (s.items || []).filter((it) => it.title || it.text);

  switch (s.type) {
    case 'text':
      return wrap(<>{head}<Markdown className="prose lead-prose">{s.text}</Markdown>{button}</>, true);

    case 'textImage': {
      const img = mediaUrl(s.image);
      return wrap(
        <div className={`text-image${s.imagePosition === 'left' ? ' image-left' : ''}`}>
          <div>{head}<Markdown className="prose lead-prose">{s.text}</Markdown>{button}</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {img ? <img className="section-photo" src={img} alt={s.imageAlt || ''} loading="lazy" /> : null}
        </div>,
      );
    }

    case 'image': {
      const img = mediaUrl(s.image);
      if (!img) return null;
      return wrap(
        <>
          {head}
          <figure className="section-figure">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt={s.imageAlt || ''} loading="lazy" />
            {s.intro && !s.title ? <figcaption>{s.intro}</figcaption> : null}
          </figure>
        </>,
      );
    }

    case 'features':
      return wrap(
        <>
          {head}
          <ul className="feature-grid">
            {items.map((it, i) => (
              <li key={i}>
                <span className="check"><Icon name="check" size={18} /></span>
                <div>{it.title ? <h3>{it.title}</h3> : null}{it.text ? <p>{it.text}</p> : null}</div>
              </li>
            ))}
          </ul>
        </>,
      );

    case 'cards':
      return wrap(
        <>
          {head}
          <div className="card-grid three">
            {items.map((it, i) => (
              <div key={i} className="card capability">
                {it.icon ? <span className="card-icon"><Icon name={it.icon} size={26} /></span> : <span className="cap-n">{String(i + 1).padStart(2, '0')}</span>}
                {it.title ? <h3>{it.title}</h3> : null}
                {it.text ? <p>{it.text}</p> : null}
              </div>
            ))}
          </div>
        </>,
      );

    case 'steps':
      return wrap(
        <>
          {head}
          <ol className="steps">
            {items.map((it, i) => (
              <li key={i}>
                <span className="step-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                {it.title ? <h3>{it.title}</h3> : null}
                {it.text ? <p>{it.text}</p> : null}
              </li>
            ))}
          </ol>
        </>,
      );

    case 'stats':
      return wrap(
        <>
          {head}
          <dl className={`stats stats-block${s.background === 'dark' ? '' : ' light'}`}>
            {items.map((it, i) => (
              <div key={i}><dt>{it.text}</dt><dd>{it.title}</dd></div>
            ))}
          </dl>
        </>,
      );

    case 'sectors': {
      const sectors = await getSectors(lang);
      return wrap(
        <>
          {head}
          <div className="card-grid four">
            {sectors.map((x) => (
              <Link key={x.slug} href={href(`/sectors/${x.slug}`)} className="card sector-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {x.image ? <img className="card-media" src={mediaUrl(x.image)} alt="" loading="lazy" /> : null}
                <span className="card-icon"><Icon name={x.icon} size={28} /></span>
                <h3>{x.name}</h3>
                <p>{x.summary}</p>
                <span className="card-more">{t('learnMore')} <Icon name="arrow" size={16} /></span>
              </Link>
            ))}
          </div>
          {button}
        </>,
      );
    }

    case 'products': {
      const products = await getProducts(lang);
      return wrap(
        <>
          {head}
          <div className="card-grid three">
            {products.map((p) => (
              <Link key={p.slug} href={href(`/products/${p.slug}`)} className="card product-card dark">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.image ? <img className="card-media" src={mediaUrl(p.image)} alt="" loading="lazy" /> : null}
                <h3>{p.name}</h3>
                {p.tagline ? <p className="product-tagline">{p.tagline}</p> : null}
                <p>{p.summary}</p>
                <span className="card-more">{t('discover', p.name || '')} <Icon name="arrow" size={16} /></span>
              </Link>
            ))}
          </div>
          {button}
        </>,
      );
    }

    case 'contactForm':
      return wrap(<>{head}<div className="card form-card"><ContactBlock /></div></>, true);

    case 'cta':
      return <CtaBand title={s.title} text={s.intro} label={s.buttonLabel} url={s.buttonUrl} />;

    default:
      return null;
  }
}
