/** Decorative "signal arcs" motif derived from the ASSERT logo mark. */
export function CircuitArt({ className }: { className?: string }) {
  const arcs = [
    { d: 'M40 180 C 220 190, 360 260, 470 420', node: [40, 180] },
    { d: 'M110 110 C 260 150, 380 230, 470 420', node: [110, 110] },
    { d: 'M70 250 C 230 255, 360 320, 470 420', node: [70, 250] },
    { d: 'M170 60 C 300 110, 400 220, 470 420', node: [170, 60] },
    { d: 'M30 320 C 200 320, 350 360, 470 420', node: [30, 320] },
  ];
  return (
    <svg className={className} viewBox="0 0 520 460" fill="none" aria-hidden="true" focusable="false">
      <path d="M470 420 L 330 30 L 120 440" stroke="currentColor" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />
      {arcs.map((a, i) => (
        <g key={i} style={{ animationDelay: `${i * 0.6}s` }} className="arc">
          <path d={a.d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity={0.55 + i * 0.08} />
          <circle cx={a.node[0]} cy={a.node[1]} r="9" stroke="currentColor" strokeWidth="2" />
          <circle cx={a.node[0]} cy={a.node[1]} r="2.5" fill="currentColor" />
        </g>
      ))}
    </svg>
  );
}

/** Subtle background grid of nodes for dark sections. */
export function NodeGrid() {
  return (
    <svg className="node-grid" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="nodes" width="44" height="44" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#nodes)" />
    </svg>
  );
}
