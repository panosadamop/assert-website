import { SmartLink } from './SmartLink';
import { Icon } from './Icon';

export function CtaBand({ title, text, label, url }: { title?: string; text?: string; label?: string; url?: string }) {
  if (!title && !label) return null;
  return (
    <section className="section">
      <div className="container">
        <div className="cta-band">
          <div>
            {title ? <h2>{title}</h2> : null}
            {text ? <p>{text}</p> : null}
          </div>
          {label ? (
            <SmartLink href={url || '/contact'} className="btn btn-accent btn-lg">
              {label} <Icon name="arrow" size={18} />
            </SmartLink>
          ) : null}
        </div>
      </div>
    </section>
  );
}
