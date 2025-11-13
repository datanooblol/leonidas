import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CodeBlock } from '../molecules/CodeBlock'

interface MarkdownRendererProps {
  content: string
}

export const MarkdownRenderer = ({ content }: MarkdownRendererProps) => (
  <div className="prose max-w-none break-words overflow-wrap-anywhere">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({children}) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
        h2: ({children}) => <h2 className="text-xl font-semibold mb-3">{children}</h2>,
        p: ({children}) => <p className="mb-2">{children}</p>,
        code: ({children}) => <code className="bg-gray-50 px-1 rounded text-sm break-all">{children}</code>,
        pre: ({children}) => <CodeBlock>{children}</CodeBlock>,
        ul: ({children}) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
        ol: ({children}) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
        li: ({children}) => <li className="mb-1">{children}</li>,
        strong: ({children}) => <strong className="font-semibold">{children}</strong>,
        table: ({children}) => <div className="overflow-x-auto mb-4"><table className="border-collapse border-2 border-gray-400 w-full rounded-lg overflow-hidden">{children}</table></div>,
        thead: ({children}) => <thead className="bg-gray-50">{children}</thead>,
        tbody: ({children}) => <tbody>{children}</tbody>,
        tr: ({children}) => <tr className="border-b border-gray-300">{children}</tr>,
        th: ({children}) => <th className="border border-gray-300 px-4 py-3 bg-gray-50 font-semibold text-left">{children}</th>,
        td: ({children}) => <td className="border border-gray-300 px-4 py-3 break-words">{children}</td>,
        hr: () => <hr className="my-8 border-gray-300" />
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
)