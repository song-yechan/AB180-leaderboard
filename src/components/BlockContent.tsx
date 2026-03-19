"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface BlockContentProps {
  content: string;
}

const mdComponents: Components = {
  // ── Headings ──
  h2: ({ children }) => (
    <h2 className="mt-6 mb-3 text-lg font-bold tracking-tight text-camp-accent">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-5 mb-2 text-base font-semibold text-camp-text">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-4 mb-1 text-sm font-semibold text-camp-text">
      {children}
    </h4>
  ),

  // ── Paragraph ──
  p: ({ children }) => (
    <p className="mb-3 text-sm leading-[1.8] text-camp-text-secondary">
      {children}
    </p>
  ),

  // ── Strong / Em ──
  strong: ({ children }) => (
    <strong className="font-semibold text-camp-text">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="text-camp-text-secondary italic">{children}</em>
  ),

  // ── Lists ──
  ul: ({ children }) => (
    <ul className="mb-3 ml-4 list-disc space-y-1 text-sm text-camp-text-secondary">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 ml-4 list-decimal space-y-1 text-sm text-camp-text-secondary">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-[1.8]">{children}</li>,

  // ── Code (inline + block) ──
  code: ({ className, children, ...props }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code
          className={`block text-xs leading-relaxed text-camp-text ${className ?? ""}`}
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className="rounded-md bg-white/[0.08] px-1.5 py-0.5 font-mono text-xs text-camp-accent">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-3 overflow-x-auto rounded-lg bg-white/[0.04] p-4 font-mono text-xs leading-relaxed">
      {children}
    </pre>
  ),

  // ── Blockquote (비유 상자) ──
  blockquote: ({ children }) => (
    <blockquote className="my-3 rounded-r-lg border-l-2 border-camp-accent/60 bg-camp-accent/[0.06] py-2 pr-4 pl-4 text-sm text-camp-text-secondary">
      {children}
    </blockquote>
  ),

  // ── Table ──
  table: ({ children }) => (
    <div className="mb-3 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-white/[0.1] text-left text-xs font-medium uppercase tracking-wider text-camp-text-muted">
      {children}
    </thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-white/[0.04]">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 text-left font-medium">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 text-camp-text-secondary">{children}</td>
  ),

  // ── Horizontal rule ──
  hr: () => <hr className="my-4 border-white/[0.06]" />,

  // ── Link ──
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-camp-accent underline decoration-camp-accent/30 underline-offset-2 transition-colors hover:decoration-camp-accent"
    >
      {children}
    </a>
  ),
};

export default function BlockContent({ content }: BlockContentProps) {
  return (
    <div className="block-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
