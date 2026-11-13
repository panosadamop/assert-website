import Link from 'next/link';
import { getI18n } from '@/lib/i18n';
import { PageHero } from '@/components/PageHero';

export default async function NotFound() {
  const { t, href } = await getI18n();
  return (
    <PageHero kicker="404" title={t('notFoundTitle')} lead={t('notFoundText')}>
      <div className="hero-actions">
        <Link href={href('/')} className="btn btn-accent btn-lg">{t('goHome')}</Link>
        <Link href={href('/contact')} className="btn btn-ghost btn-lg">{t('contactUs')}</Link>
      </div>
    </PageHero>
  );
}
