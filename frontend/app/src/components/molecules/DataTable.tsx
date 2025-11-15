interface DataTableProps {
  content: string
  title?: string
}

export const DataTable = ({ content, title }: DataTableProps) => {
  try {
    const data = typeof content === 'string' ? JSON.parse(content) : content
    
    if (Array.isArray(data) && data.length > 0) {
      const headers = Object.keys(data[0])
      
      return (
        <div className="border border-gray-200 dark:border-gray-600 rounded">
          <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm font-medium">
            📊 {title || 'Query Results'}
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-xs">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  {headers.map(header => (
                    <th key={header} className="px-2 py-1 text-left font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 100).map((row, idx) => (
                  <tr key={idx} className="border-t border-gray-200 dark:border-gray-600">
                    {headers.map(header => (
                      <td key={header} className="px-2 py-1">
                        {String(row[header] || '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 100 && (
              <div className="p-2 text-xs text-gray-500 text-center">
                Showing first 100 of {data.length} rows
              </div>
            )}
          </div>
        </div>
      )
    }
  } catch (e) {
    // Fallback to markdown table
  }
  
  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded">
      <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm font-medium">
        📊 {title || 'Results'}
      </div>
      <pre className="text-xs p-3 whitespace-pre-wrap overflow-x-auto">
        {content}
      </pre>
    </div>
  )
}