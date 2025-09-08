import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const schema = {
  ...defaultSchema,
  tagNames: [...defaultSchema.tagNames.filter((t) => t !== 'img'), 'input'],
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes.a || []), 'target', 'rel'],
    code: ['className'],
    input: ['type', 'checked', 'disabled'],
    th: ['colSpan', 'rowSpan', 'align'],
    td: ['colSpan', 'rowSpan', 'align']
  }
};

function Code({ inline, className, children, ...props }) {
  const match = /language-(\w+)/.exec(className || '');
  const rawCode = String(children);
  const code = rawCode.replace(/\n$/, '');
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };
  // Sometimes the AI returns fenced blocks wrapping single words like `n`.
  // Such blocks have no newlines and no language class. Treat them as inline
  // code so they render correctly within the sentence instead of as a block.
  if (inline || (!rawCode.includes('\n') && !className)) {
    return (
      <code className={className} {...props}>
        {code}
      </code>
    );
  }
  return (
    <div className="code-block">
      <button className="copy-btn" onClick={handleCopy} aria-label="Copy code">
        Copy
      </button>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={match ? match[1] : undefined}
        PreTag="div"
        {...props}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export function renderMarkdownToSafeHtml(markdown) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[[rehypeSanitize, schema]]}
      components={{
        a: ({ node, ...props }) => (
          <a {...props} target="_blank" rel="noopener noreferrer" />
        ),
        code: Code
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}

export default function MarkdownMessage({ content }) {
  return <div className="markdown-content">{renderMarkdownToSafeHtml(content)}</div>;
}

