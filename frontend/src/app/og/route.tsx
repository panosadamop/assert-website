import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getSite } from '@/lib/cms';

export const runtime = 'nodejs';

const fontDir = path.join(process.cwd(), 'node_modules', '@fontsource', 'ubuntu', 'files');
const logoFile = path.join(process.cwd(), 'public', 'logo-white.png');

/** Branded 1200×630 social image: /og?title=…&kicker=… */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get('title') || 'ASSERT').slice(0, 120);
  const kicker = (searchParams.get('kicker') || '').slice(0, 60);
  const { settings } = await getSite().catch(() => ({ settings: {} as Record<string, string> }));
  const primary = (settings as { primaryColor?: string }).primaryColor || '#20282d';
  const accent = (settings as { accentColor?: string }).accentColor || '#3cc6e0';

  const [bold, regular, logo] = await Promise.all([
    readFile(path.join(fontDir, 'ubuntu-latin-700-normal.woff')),
    readFile(path.join(fontDir, 'ubuntu-latin-400-normal.woff')),
    readFile(logoFile),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: primary, padding: '72px 80px', fontFamily: 'Ubuntu', color: '#fff', position: 'relative' }}>
        <svg width="560" height="500" viewBox="0 0 520 460" style={{ position: 'absolute', right: -40, bottom: -60, opacity: 0.22 }}>
          <path d="M470 420 L 330 30 L 120 440" stroke="#fff" strokeWidth="3" fill="none" />
          <path d="M40 180 C 220 190, 360 260, 470 420" stroke="#fff" strokeWidth="3" fill="none" />
          <path d="M110 110 C 260 150, 380 230, 470 420" stroke="#fff" strokeWidth="3" fill="none" />
          <path d="M70 250 C 230 255, 360 320, 470 420" stroke="#fff" strokeWidth="3" fill="none" />
          <circle cx="40" cy="180" r="10" stroke="#fff" strokeWidth="3" fill="none" />
          <circle cx="110" cy="110" r="10" stroke="#fff" strokeWidth="3" fill="none" />
          <circle cx="70" cy="250" r="10" stroke="#fff" strokeWidth="3" fill="none" />
        </svg>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} height={48} width={261} alt="" />
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 940 }}>
          {kicker ? <div style={{ fontSize: 28, color: accent, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 20 }}>{kicker}</div> : null}
          <div style={{ fontSize: title.length > 60 ? 54 : 68, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
        </div>
        <div style={{ display: 'flex', width: 120, height: 6, background: accent, borderRadius: 3 }} />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Ubuntu', data: bold, weight: 700, style: 'normal' },
        { name: 'Ubuntu', data: regular, weight: 400, style: 'normal' },
      ],
      headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=86400' },
    },
  );
}
