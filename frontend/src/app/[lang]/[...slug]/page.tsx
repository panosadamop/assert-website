import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPage, getPages, siteUrl } from '@/lib/cms';
import { getI18n } from '@/lib/i18n';
import { breadcrumbLd, graph, pageMetadata } from '@/lib/seo';
import { PageHero } from '@/components/PageHero';
import { Markdown } from '@/components/Markdown';
import { JsonLd } from '@/components/JsonLd';
import { Sections } from '@/components/Sections';
import { SmartLink } from '@/components/SmartLink';
import { Icon } from '@/components/Icon';

export const revalidate = 300;

/** Free-form pages from CMS → Pages. Only single-segment URLs exist (/privacy); deeper URLs are 404. */
type Props = { params: Promise<{ slug: string[] }> };

export async function generateStaticParams() {
  return (await getPages()).map((p) => ({ slug: [p.slug] }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (slug.length !== 1) return {};
  const { lang } = await getI18n();
  const page = await getPage(slug[0], lang);
  if (!page) return {};
  return pageMetadata({ path: `/${slug[0]}`, title: page.title, description: page.intro, seo: page.seo, type: 'article', kicker: page.eyebrow });
}

export default async function GenericPage({ params }: Props) {
  const { slug: parts } = await params;
  if (parts.length !== 1) notFound();
  const slug = parts[0];
  const { lang, t, prefix } = await getI18n();
  const [page, base] = await Promise.all([getPage(slug, lang), siteUrl()]);
  if (!page) notFound();
  const crumbs = [{ name: t('home'), path: '/' }, { name: page.title, path: `/${slug}` }];
  const hasButtons = page.primaryCta?.label || page.secondaryCta?.label;
  return (
    <>
      <JsonLd data={graph(breadcrumbLd(base + prefix, crumbs), { '@type': 'WebPage', name: page.title, url: `${base}${prefix}/${slug}`, inLanguage: lang, dateModified: page.updatedAt })} />
      <PageHero kicker={page.eyebrow} title={page.title} lead={page.intro} crumbs={crumbs} image={page.heroImage}>
        {hasButtons ? (
          <div className="hero-actions">
            {page.primaryCta?.label ? (
              <SmartLink href={page.primaryCta.url} className="btn btn-accent btn-lg">{page.primaryCta.label} <Icon name="arrow" size={18} /></SmartLink>
            ) : null}
            {page.secondaryCta?.label ? (
              <SmartLink href={page.secondaryCta.url} className="btn btn-ghost btn-lg">{page.secondaryCta.label}</SmartLink>
            ) : null}
          </div>
        ) : null}
      </PageHero>
      {page.body ? (
        <section className="section">
          <div className="container narrow"><Markdown>{page.body}</Markdown></div>
        </section>
      ) : null}
      <Sections sections={page.sections} />
    </>
  );
}
