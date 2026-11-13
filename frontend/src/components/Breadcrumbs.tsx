import Link from 'next/link';
import { getI18n } from '@/lib/i18n';

export async function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  const { t, href } = await getI18n();
  return (
    <nav aria-label={t('breadcrumb')} className="breadcrumbs">
      <ol>
        {items.map((it, i) => (
          <li key={it.path}>
            {i < items.length - 1 ? <Link href={href(it.path)}>{it.name}</Link> : <span aria-current="page">{it.name}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
