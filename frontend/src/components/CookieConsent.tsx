'use client';

import Script from 'next/script';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { CookieTexts } from '@/lib/types';

const COOKIE = 'cookie_consent';
const MAX_AGE = 60 * 60 * 24 * 180; // 6 months
const OPEN_EVENT = 'cookie-settings:open';

type Consent = { analytics: boolean };

function readConsent(): Consent | null {
  const m = document.cookie.match(/(?:^|;\s*)cookie_consent=([^;]+)/);
  if (!m) return null;
  return { analytics: decodeURIComponent(m[1]).includes('analytics:1') };
}

function writeConsent(c: Consent) {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE}=${encodeURIComponent(`v1|analytics:${c.analytics ? 1 : 0}`)}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}`;
}

/** Removes Google Analytics cookies after consent is withdrawn. */
function clearAnalyticsCookies() {
  const host = location.hostname.split('.');
  const domains = ['', ...host.map((_, i) => '.' + host.slice(i).join('.'))];
  document.cookie.split(';').map((c) => c.split('=')[0].trim()).filter((n) => /^(_ga|_gid|_gat)/.test(n)).forEach((n) => {
    domains.forEach((d) => { document.cookie = `${n}=; Max-Age=0; Path=/${d ? `; Domain=${d}` : ''}`; });
  });
}

/** Footer button that reopens the cookie settings. */
export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button type="button" className="link-button" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
      {label}
    </button>
  );
}

/**
 * GDPR cookie consent: banner with equally prominent "Accept" / "Necessary only" buttons,
 * a settings dialog (native <dialog>: focus is trapped and Esc closes it) and consent-gated
 * loading of Google Analytics / Tag Manager.
 */
export function CookieConsent({ texts, policyHref, ga, gtm }: { texts: CookieTexts; policyHref?: string; ga?: string; gtm?: string }) {
  const [ready, setReady] = useState(false);
  const [consent, setConsent] = useState<Consent | null>(null);
  const [analytics, setAnalytics] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const dialogTitleId = useId();

  const openSettings = useCallback(() => {
    setAnalytics(readConsent()?.analytics ?? false);
    dialog.current?.showModal();
  }, []);

  useEffect(() => {
    setConsent(readConsent());
    setReady(true);
    window.addEventListener(OPEN_EVENT, openSettings);
    return () => window.removeEventListener(OPEN_EVENT, openSettings);
  }, [openSettings]);

  const save = (c: Consent) => {
    const withdrew = consent?.analytics && !c.analytics;
    writeConsent(c);
    setConsent(c);
    if (dialog.current?.open) dialog.current.close();
    if (withdrew) {
      clearAnalyticsCookies();
      location.reload(); // unload analytics scripts that already ran
      return;
    }
    // Banner disappears: keep keyboard focus at a sensible place.
    document.getElementById('main')?.focus({ preventScroll: true });
  };

  const tx = {
    title: texts.title || 'Your privacy',
    text: texts.text || 'We use necessary cookies to make this website work. With your permission we would also like to use analytics cookies.',
    accept: texts.acceptLabel || 'Accept all',
    reject: texts.rejectLabel || 'Necessary only',
    customize: texts.customizeLabel || 'Cookie settings',
    save: texts.saveLabel || 'Save choices',
    policy: texts.policyLabel || 'Privacy policy',
    necessaryTitle: texts.necessaryTitle || 'Necessary',
    necessaryText: texts.necessaryText || 'Required for the website to work. Always on.',
    analyticsTitle: texts.analyticsTitle || 'Analytics',
    analyticsText: texts.analyticsText || 'Help us understand how visitors use the website.',
  };

  const analyticsAllowed = !!consent?.analytics;

  return (
    <>
      {ready && !consent ? (
        <section className="cookie-banner" aria-labelledby={titleId}>
          <div className="cookie-inner">
            <div className="cookie-copy">
              <h2 id={titleId}>{tx.title}</h2>
              <p>
                {tx.text}{' '}
                {policyHref ? <a href={policyHref}>{tx.policy}</a> : null}
              </p>
            </div>
            <div className="cookie-actions">
              <button type="button" className="btn btn-primary" onClick={() => save({ analytics: true })}>{tx.accept}</button>
              <button type="button" className="btn btn-primary" onClick={() => save({ analytics: false })}>{tx.reject}</button>
              <button type="button" className="btn btn-outline" onClick={openSettings}>{tx.customize}</button>
            </div>
          </div>
        </section>
      ) : null}

      <dialog ref={dialog} className="cookie-dialog" aria-labelledby={dialogTitleId}>
        <form method="dialog" onSubmit={(e) => { e.preventDefault(); save({ analytics }); }}>
          <h2 id={dialogTitleId}>{tx.customize}</h2>
          <p>{tx.text}</p>
          <fieldset>
            <legend className="sr-only">{tx.customize}</legend>
            <div className="cookie-option">
              <input type="checkbox" id={`${dialogTitleId}-n`} checked disabled aria-describedby={`${dialogTitleId}-nd`} />
              <div>
                <label htmlFor={`${dialogTitleId}-n`}>{tx.necessaryTitle}</label>
                <p id={`${dialogTitleId}-nd`}>{tx.necessaryText}</p>
              </div>
            </div>
            <div className="cookie-option">
              <input type="checkbox" id={`${dialogTitleId}-a`} checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} aria-describedby={`${dialogTitleId}-ad`} />
              <div>
                <label htmlFor={`${dialogTitleId}-a`}>{tx.analyticsTitle}</label>
                <p id={`${dialogTitleId}-ad`}>{tx.analyticsText}</p>
              </div>
            </div>
          </fieldset>
          <div className="cookie-actions">
            <button type="submit" className="btn btn-primary">{tx.save}</button>
            <button type="button" className="btn btn-primary" onClick={() => save({ analytics: true })}>{tx.accept}</button>
            <button type="button" className="btn btn-outline" onClick={() => save({ analytics: false })}>{tx.reject}</button>
          </div>
          {policyHref ? <p className="cookie-policy"><a href={policyHref}>{tx.policy}</a></p> : null}
        </form>
      </dialog>

      {analyticsAllowed && ga ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}',{anonymize_ip:true});`}
          </Script>
        </>
      ) : null}
      {analyticsAllowed && gtm ? (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      ) : null}
    </>
  );
}
