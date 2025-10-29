import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
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
          pre: ({children}) => <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-x-auto">{children}</pre>,
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