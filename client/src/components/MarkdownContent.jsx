import React from 'react';
import DOMPurify from 'dompurify';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { isLikelyHtml } from '../utils/richContent';

const getClassName = (className = '') => `text-gray-700 leading-7 ${className}`.trim();

const MarkdownContent = ({ content = '', className = '' }) => {
  const source = String(content || '').trim();
  if (!source) return null;

  if (isLikelyHtml(source)) {
    const sanitizedSource = DOMPurify.sanitize(source, {
      USE_PROFILES: { html: true },
      ALLOW_DATA_ATTR: false
    });

    return (
      <div
        className={getClassName(className)}
        dangerouslySetInnerHTML={{ __html: sanitizedSource }}
      />
    );
  }

  return (
    <div className={getClassName(className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => <h1 className="mt-8 mb-4 text-3xl font-bold text-gray-900" {...props} />,
          h2: (props) => <h2 className="mt-7 mb-4 text-2xl font-bold text-gray-900" {...props} />,
          h3: (props) => <h3 className="mt-6 mb-3 text-xl font-semibold text-gray-900" {...props} />,
          p: (props) => <p className="mb-4 text-base leading-7 text-gray-700" {...props} />,
          ul: (props) => <ul className="mb-4 list-disc space-y-2 pl-6" {...props} />,
          ol: (props) => <ol className="mb-4 list-decimal space-y-2 pl-6" {...props} />,
          li: (props) => <li className="text-gray-700" {...props} />,
          blockquote: (props) => (
            <blockquote className="my-6 border-l-4 border-blue-200 bg-blue-50/50 px-4 py-3 italic text-gray-700" {...props} />
          ),
          a: (props) => (
            <a
              className="font-medium text-blue-700 underline underline-offset-2 hover:text-blue-800"
              target="_blank"
              rel="noreferrer"
              {...props}
            />
          ),
          img: (props) => (
            <img
              className="my-6 w-full max-h-[540px] rounded-xl border border-gray-200 bg-gray-50 object-contain"
              loading="lazy"
              {...props}
            />
          ),
          hr: (props) => <hr className="my-6 border-gray-200" {...props} />,
          code: ({ inline, className: codeClassName, children, ...props }) => {
            if (inline) {
              return (
                <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm text-gray-800" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={`block overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100 ${codeClassName || ''}`} {...props}>
                {children}
              </code>
            );
          },
          pre: (props) => <pre className="my-5 overflow-x-auto rounded-lg bg-gray-900 p-0" {...props} />,
          table: (props) => (
            <div className="my-6 overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm" {...props} />
            </div>
          ),
          th: (props) => <th className="border border-gray-200 bg-gray-50 px-3 py-2 font-semibold text-gray-800" {...props} />,
          td: (props) => <td className="border border-gray-200 px-3 py-2 text-gray-700" {...props} />
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownContent;
