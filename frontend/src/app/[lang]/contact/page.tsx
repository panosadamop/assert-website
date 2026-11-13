import type { Metadata } from 'next';
import { getContact, siteUrl } from '@/lib/cms';
import { getI18n } from '@/lib/i18n';
import { breadcrumbLd, graph, pageMetadata } from '@/lib/seo';
import { PageHero } from '@/components/PageHero';
import { ContactBlock } from '@/components/ContactBlock';
import { Icon } from '@/components/Icon';
import { JsonLd } from '@/components/JsonLd';
import { SocialLinks } from '@/components/SocialLinks';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { lang } = await getI18n();
  const c = await getContact(lang);
  return pageMetadata({ path: '/contact', title: c.title || 'Contact', description: c.intro, seo: c.seo, kicker: c.title || 'Contact' });
}

export default async function ContactPage() {
  const { lang, t, site, prefix } = await getI18n();
  const [c, base] = await Promise.all([getContact(lang), siteUrl()]);
  const info = site.settings.contact || {};
  const crumbs = [{ name: t('home'), path: '/' }, { name: c.title || 'Contact', path: '/contact' }];
  const showSocial = site.settings.showSocialOnContact !== false && (site.settings.socialLinks || []).some((l) => l.url);
  return (
    <>
      <JsonLd data={graph(breadcrumbLd(base + prefix, crumbs), { '@type': 'ContactPage', name: c.title, url: `${base}${prefix}/contact`, inLanguage: lang, about: { '@id': `${base}/#organization` } })} />
      <PageHero kicker={c.title || 'Contact'} title={c.headline || c.title || 'Contact'} lead={c.intro} crumbs={crumbs} />
      <section className="section">
        <div className="container contact-grid">
          <div className="card form-card">
            <ContactBlock />
          </div>
          <aside className="contact-aside" aria-labelledby="contact-details">
            <h2 id="contact-details">{t('contactDetails')}</h2>
            <ul className="contact-list">
              {info.email ? <li><Icon name="mail" size={18} /><a href={`mailto:${info.email}`}>{info.email}</a></li> : null}
              {info.phone ? <li><Icon name="phone" size={18} /><a href={`tel:${info.phone.replace(/\s/g, '')}`}>{info.phone}</a></li> : null}
              {info.street || info.city ? (
                <li>
                  <Icon name="pin" size={18} />
                  <span>
                    {[info.street, [info.postalCode, info.city].filter(Boolean).join(' ')].filter(Boolean).join(', ')}
                    {info.mapUrl ? (
                      <> · <a href={info.mapUrl} target="_blank" rel="noopener noreferrer">{t('map')}<span className="sr-only"> {t('opensInNewTab')}</span></a></>
                    ) : null}
                  </span>
                </li>
              ) : null}
            </ul>
            {showSocial ? (
              <>
                <h2 className="follow-title">{t('followUs')}</h2>
                <SocialLinks variant="list" />
              </>
            ) : null}
          </aside>
        </div>
      </section>
    </>
  );
}
