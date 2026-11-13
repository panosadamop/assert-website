import type { ReactNode } from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import { CircuitArt, NodeGrid } from './CircuitArt';
import { HeroDecor } from './HeroDecor';
import { mediaUrl } from '@/lib/cms';

export function PageHero({ kicker, title, lead, crumbs, children, icon, image }: {
  kicker?: string; title: string; lead?: string; crumbs?: { name: string; path: string }[]; children?: ReactNode; icon?: ReactNode; image?: string;
}) {
  const photo = mediaUrl(image);
  return (
    <section className={`page-hero dark${photo ? ' has-photo' : ''}`}>
      {photo ? <img className="hero-photo" src={photo} alt="" fetchPriority="high" /> : null}
      <NodeGrid />
      <HeroDecor prism={false} />
      {photo ? null : <CircuitArt className="page-hero-art" />}
      <div className="container">
        {crumbs ? <Breadcrumbs items={crumbs} /> : null}
        <div className="page-hero-body">
          {icon ? <div className="hero-icon">{icon}</div> : null}
          {kicker ? <p className="eyebrow">{kicker}</p> : null}
          <h1 className="hero-title">{title}</h1>
          {lead ? <p className="lead">{lead}</p> : null}
          {children}
        </div>
      </div>
    </section>
  );
}
