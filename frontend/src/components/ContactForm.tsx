'use client';

import { useEffect, useId, useRef, useState } from 'react';

export type ContactFormLabels = {
  requiredNote: string; name: string; organisation: string; email: string; phone: string; sector: string; product: string;
  select: string; message: string; send: string; sending: string; sentTitle: string; sentText: string; error: string;
};

/** Visual "*" for required fields; screen readers get "required" from the input itself. */
const Req = () => <span className="req" aria-hidden="true"> *</span>;

export function ContactForm({ sectors, products, consent, success, labels }: {
  sectors: string[]; products: string[]; consent?: string; success?: string; labels: ContactFormLabels;
}) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const doneRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const noteId = useId();

  useEffect(() => {
    if (state === 'done') doneRef.current?.focus();
    if (state === 'error') errorRef.current?.focus();
  }, [state]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState('sending');
    setError('');
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || labels.error);
      setState('done');
      form.reset();
    } catch (err) {
      setError((err as Error).message || labels.error);
      setState('error');
    }
  }

  if (state === 'done') {
    return (
      <div className="form-success" role="status">
        <h2 ref={doneRef} tabIndex={-1}>{labels.sentTitle}</h2>
        <p>{success || labels.sentText}</p>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={onSubmit} aria-describedby={noteId}>
      <p id={noteId} className="form-note">{labels.requiredNote}</p>
      <div className="form-row">
        <label>
          <span>{labels.name}<Req /></span>
          <input name="name" required aria-required="true" autoComplete="name" maxLength={120} />
        </label>
        <label>
          <span>{labels.organisation}</span>
          <input name="organisation" autoComplete="organization" maxLength={160} />
        </label>
      </div>
      <div className="form-row">
        <label>
          <span>{labels.email}<Req /></span>
          <input name="email" type="email" required aria-required="true" autoComplete="email" maxLength={254} />
        </label>
        <label>
          <span>{labels.phone}</span>
          <input name="phone" type="tel" autoComplete="tel" maxLength={40} />
        </label>
      </div>
      {sectors.length || products.length ? (
        <div className="form-row">
          {sectors.length ? (
            <label>
              <span>{labels.sector}</span>
              <select name="sector" defaultValue="">
                <option value="">{labels.select}</option>
                {sectors.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
          ) : null}
          {products.length ? (
            <label>
              <span>{labels.product}</span>
              <select name="product" defaultValue="">
                <option value="">{labels.select}</option>
                {products.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
          ) : null}
        </div>
      ) : null}
      <label>
        <span>{labels.message}<Req /></span>
        <textarea name="message" required aria-required="true" rows={6} minLength={5} maxLength={5000} />
      </label>
      {/* Honeypot – hidden from people, tempting for bots. */}
      <div className="hp" aria-hidden="true">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      {consent ? (
        <label className="consent">
          <input type="checkbox" name="consent" required aria-required="true" />
          <span>{consent}<Req /></span>
        </label>
      ) : null}
      {state === 'error' ? <p className="form-error" role="alert" ref={errorRef} tabIndex={-1}>{error}</p> : null}
      <p className="sr-only" role="status" aria-live="polite">{state === 'sending' ? labels.sending : ''}</p>
      <button className="btn btn-primary btn-lg" type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? labels.sending : labels.send}
      </button>
    </form>
  );
}
