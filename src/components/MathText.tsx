"use client";
import * as React from 'react';
import katex from 'katex';

type Props = { text: string };

export default function MathText({ text }: Props) {
  const parts: React.ReactNode[] = [];
  const regex = /(\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|\$\$([\s\S]+?)\$\$)/g; // \[...], \(...), $$...$$
  let lastIndex = 0;
  let i = 0;
  for (let m; (m = regex.exec(text)); ) {
    if (m.index > lastIndex) {
      const plain = text.slice(lastIndex, m.index);
      parts.push(<span key={`t-${i++}`}>{plain}</span>);
    }
    const content = m[2] ?? m[3] ?? m[4] ?? '';
    const displayMode = Boolean(m[2] || m[4]);
    let html = '';
    try {
      html = katex.renderToString(content, { displayMode, throwOnError: false, strict: 'ignore' });
    } catch {
      html = content; // fallback: raw
    }
    parts.push(<span key={`m-${i++}`} dangerouslySetInnerHTML={{ __html: html }} />);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(<span key={`t-${i++}`}>{text.slice(lastIndex)}</span>);
  }
  return <div className="space-y-2">{parts}</div>;
}
