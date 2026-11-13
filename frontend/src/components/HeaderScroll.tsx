'use client';

import { useEffect } from 'react';

/** Sets <html data-scrolled> once the page is scrolled, so the header can switch to its solid style. */
export function HeaderScroll() {
  useEffect(() => {
    const root = document.documentElement;
    let ticking = false;
    const update = () => {
      ticking = false;
      if (window.scrollY > 24) root.dataset.scrolled = '';
      else delete root.dataset.scrolled;
    };
    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return null;
}
