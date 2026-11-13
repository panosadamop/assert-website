import { getI18n } from '@/lib/i18n';
import { Icon } from './Icon';

const NAMES: Record<string, string> = {
  linkedin: 'LinkedIn', x: 'X', facebook: 'Facebook', instagram: 'Instagram', youtube: 'YouTube', tiktok: 'TikTok',
  threads: 'Threads', bluesky: 'Bluesky', mastodon: 'Mastodon', github: 'GitHub', vimeo: 'Vimeo', pinterest: 'Pinterest',
  whatsapp: 'WhatsApp', telegram: 'Telegram', website: 'Website',
};

/**
 * Social media buttons managed in Settings → Contact & social.
 * "icons": round icon buttons (footer). "list": icon + visible name (contact page).
 */
export async function SocialLinks({ variant = 'icons', className }: { variant?: 'icons' | 'list'; className?: string }) {
  const { site, t } = await getI18n();
  const siteName = site.settings.siteName || 'ASSERT';
  const links = (site.settings.socialLinks || []).filter((l) => l.url && /^(https?:\/\/|mailto:)/i.test(l.url));
  if (!links.length) return null;
  return (
    <ul className={`social ${variant === 'list' ? 'social-list' : ''} ${className || ''}`.trim()}>
      {links.map((l, i) => {
        const name = l.label || NAMES[l.network || ''] || l.network || 'Link';
        // Accessible name, e.g. "ASSERT on LinkedIn (opens in a new tab)". For the list variant
        // the visible name starts the accessible name, so speech-input users can say what they see.
        const full = variant === 'list' ? name : t('socialOn', siteName, name);
        return (
          <li key={`${l.network}-${i}`}>
            <a href={l.url} target="_blank" rel="noopener noreferrer me">
              <Icon name={l.network || 'website'} size={18} />
              {variant === 'list' ? <span>{full}</span> : <span className="sr-only">{full}</span>}
              <span className="sr-only"> {t('opensInNewTab')}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
