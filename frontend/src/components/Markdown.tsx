import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/** Renders CMS markdown safely (raw HTML is not allowed). */
export function Markdown({ children, className = 'prose' }: { children?: string; className?: string }) {
  if (!children) return null;
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children: c }) => {
            const external = href && /^https?:\/\//.test(href);
            return (
              <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                {c}
              </a>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
