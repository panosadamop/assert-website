import Script from 'next/script';
import type { Settings } from '@/lib/types';
import { CookieConsent } from './CookieConsent';

const ID = /^[A-Za-z0-9-]+$/;

/**
 * Analytics configured in the CMS.
 * - Google Analytics 4 / Tag Manager set cookies → loaded only after consent (see CookieConsent).
 * - Plausible is cookie-free → always loaded when configured.
 */
export function Analytics({ settings, policyHref }: { settings: Settings; policyHref?: string }) {
  const a = settings.analytics || {};
  const ga = a.gaMeasurementId && ID.test(a.gaMeasurementId) ? a.gaMeasurementId : '';
  const gtm = a.gtmId && ID.test(a.gtmId) ? a.gtmId : '';
  const plausible = a.plausibleDomain && /^[a-z0-9.-]+$/i.test(a.plausibleDomain) ? a.plausibleDomain : '';
  const cookies = settings.cookies || {};
  return (
    <>
      {cookies.enabled !== false ? (
        <CookieConsent texts={cookies} policyHref={policyHref} ga={ga} gtm={gtm} />
      ) : (
        // Cookie banner switched off in the CMS: the site owner takes responsibility for consent.
        <>
          {ga ? <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" /> : null}
          {ga ? <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}',{anonymize_ip:true});`}</Script> : null}
          {gtm ? <Script id="gtm" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}</Script> : null}
        </>
      )}
      {plausible ? <Script src="https://plausible.io/js/script.js" data-domain={plausible} strategy="afterInteractive" /> : null}
    </>
  );
}
