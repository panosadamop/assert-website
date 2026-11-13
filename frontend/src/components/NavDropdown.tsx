'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { Icon } from './Icon';
import type { NavItem } from './nav-types';

/**
 * Header item with a submenu (WCAG 2.1: keyboard operable, Esc closes, hover content is
 * hoverable/dismissible/persistent, state exposed with aria-expanded).
 */
export function NavDropdown({ item, toggleLabel, current }: { item: NavItem; toggleLabel: string; current?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const id = useId();
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        if (ref.current?.contains(document.activeElement)) btn.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className={`nav-item has-menu${open ? ' open' : ''}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <Link href={item.href} aria-current={current ? 'page' : undefined}>{item.label}</Link>
      <button
        ref={btn}
        type="button"
        className="submenu-toggle"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="chevron" size={16} />
        <span className="sr-only">{toggleLabel}</span>
      </button>
      <div id={id} className="menu" hidden={!open}>
        <ul>
          {(item.children || []).map((c) => (
            <li key={c.href}>
              <Link href={c.href} className="menu-link" onClick={() => setOpen(false)}>
                <span className="menu-icon"><Icon name={c.icon} size={20} /></span>
                <span>
                  <strong>{c.label}</strong>
                  {c.description ? <small>{c.description}</small> : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
