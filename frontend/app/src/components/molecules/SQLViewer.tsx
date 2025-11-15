interface SQLViewerProps {
  content: string
  title?: string
}

export const SQLViewer = ({ content, title }: SQLViewerProps) => (
  <div className="border border-gray-200 dark:border-gray-600 rounded">
    <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm font-medium">
      🗄️ {title || 'SQL Query'}
    </div>
    <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded-b overflow-x-auto">
      <code>{content}</code>
    </pre>
  </div>
)