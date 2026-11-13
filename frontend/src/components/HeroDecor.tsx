/**
 * Decorative layers for hero banners: soft accent glows, the "A" prism from the logo mark,
 * film grain and a slanted bottom edge. Purely visual – hidden from assistive technology.
 */
export function HeroDecor({ prism = true }: { prism?: boolean }) {
  return (
    <div className="hero-decor" aria-hidden="true">
      <span className="glow g1" />
      <span className="glow g2" />
      <span className="glow g3" />
      {prism ? (
        <svg className="hero-prism" viewBox="0 0 600 560" fill="none" focusable="false">
          <defs>
            <linearGradient id="prism-stroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity=".9" />
              <stop offset=".55" stopColor="currentColor" stopOpacity=".25" />
              <stop offset="1" stopColor="#ffffff" stopOpacity=".05" />
            </linearGradient>
            <linearGradient id="prism-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity=".16" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path className="p1" d="M300 20 L580 540 L20 540 Z" stroke="url(#prism-stroke)" strokeWidth="1.5" fill="url(#prism-fill)" />
          <path className="p2" d="M300 120 L500 500 L100 500 Z" stroke="url(#prism-stroke)" strokeWidth="1" />
          <path className="p3" d="M300 220 L420 460 L180 460 Z" stroke="url(#prism-stroke)" strokeWidth="1" />
          <path d="M300 20 L300 540 M20 540 L420 300 M580 540 L180 300" stroke="url(#prism-stroke)" strokeWidth=".75" strokeDasharray="2 8" />
        </svg>
      ) : null}
      <span className="grain" />
      <svg className="hero-edge" viewBox="0 0 1440 90" preserveAspectRatio="none" focusable="false">
        <path d="M0 90 L0 60 L1440 0 L1440 90 Z" fill="currentColor" />
      </svg>
    </div>
  );
}
