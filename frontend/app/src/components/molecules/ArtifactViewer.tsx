interface ArtifactViewerProps {
  artifact: {
    type: string
    content: any
    title?: string
  }
}

import { SQLViewer } from './SQLViewer'
import { DataTable } from './DataTable'
import { ChartViewer } from './ChartViewer'

export const ArtifactViewer = ({ artifact }: ArtifactViewerProps) => {
  switch (artifact.type) {
    case 'sql':
      return <SQLViewer content={artifact.content} title={artifact.title} />
    
    case 'results':
      return <DataTable content={artifact.content} title={artifact.title} />
    
    case 'chart':
      return <ChartViewer content={artifact.content} title={artifact.title} />
    
    default:
      return (
        <div className="border border-gray-200 dark:border-gray-600 rounded">
          <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm font-medium">
            📄 {artifact.title || artifact.type}
          </div>
          <div className="p-3">
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(artifact.content, null, 2)}
            </pre>
          </div>
        </div>
      )
  }
}