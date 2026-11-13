'use client';

import { useEffect, useState } from 'react';

/** Error boundary. Texts come from the CMS (Interface texts) via data attributes on <body>. */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  const [tx, setTx] = useState({ kicker: 'Temporarily unavailable', title: 'Something went wrong', text: 'Please try again in a moment.', retry: 'Try again' });
  useEffect(() => {
    const d = document.body.dataset;
    setTx((p) => ({
      kicker: d.errorKicker || p.kicker,
      title: d.errorTitle || p.title,
      text: d.errorText || p.text,
      retry: d.errorRetry || p.retry,
    }));
  }, []);
  return (
    <section className="page-hero dark">
      <div className="container">
        <div className="page-hero-body">
          <p className="eyebrow">{tx.kicker}</p>
          <h1>{tx.title}</h1>
          <p className="lead">{tx.text}</p>
          <div className="hero-actions">
            <button type="button" className="btn btn-accent btn-lg" onClick={() => reset()}>{tx.retry}</button>
          </div>
        </div>
      </div>
    </section>
  );
}
