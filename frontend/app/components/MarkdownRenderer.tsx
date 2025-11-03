import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState } from 'react';
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    // Extract text from nested code element
    let codeText = '';
    if (React.isValidElement(children) && children.props.children) {
      codeText = children.props.children;
    } else {
      codeText = children?.toString() || '';
    }
    
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-x-auto pr-12">{children}</pre>
      <button
        onClick={copyToClipboard}
        className="absolute top-2 right-2 p-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        title="Copy code"
      >
        {copied ? '✓' : '📋'}
      </button>
    </div>
  );
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({children}) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
          h2: ({children}) => <h2 className="text-xl font-semibold mb-3">{children}</h2>,
          p: ({children}) => <p className="mb-2">{children}</p>,
          code: ({children}) => <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-sm">{children}</code>,
          pre: ({children}) => <CodeBlock>{children}</CodeBlock>,
          ul: ({children}) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
          ol: ({children}) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
          li: ({children}) => <li className="mb-1">{children}</li>,
          strong: ({children}) => <strong className="font-semibold">{children}</strong>,
          table: ({children}) => <table className="border-collapse border-2 border-gray-400 dark:border-gray-500 w-full mb-4 rounded-lg overflow-hidden">{children}</table>,
          thead: ({children}) => <thead className="bg-gray-100 dark:bg-gray-700">{children}</thead>,
          tbody: ({children}) => <tbody>{children}</tbody>,
          tr: ({children}) => <tr className="border-b border-gray-300 dark:border-gray-600">{children}</tr>,
          th: ({children}) => <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 bg-gray-100 dark:bg-gray-700 font-semibold text-left">{children}</th>,
          td: ({children}) => <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">{children}</td>,
          hr: () => <hr className="my-8 border-gray-300 dark:border-gray-600" />
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}