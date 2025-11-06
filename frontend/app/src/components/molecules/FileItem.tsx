import { FileIcon } from '../atoms/FileIcon'

interface FileData {
  file_id: string
  filename: string
  size: number
  file_type?: string
  selected: boolean
}

interface FileItemProps {
  file: FileData
  chatWithData: boolean
  onToggleSelection: (fileId: string) => void
  onViewMetadata: (fileId: string) => void
  onViewPreview: (fileId: string) => void
}

export const FileItem = ({ 
  file, 
  chatWithData, 
  onToggleSelection, 
  onViewMetadata, 
  onViewPreview 
}: FileItemProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div
      className={`p-3 rounded-lg border transition-all ${
        !chatWithData
          ? 'border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 opacity-50'
          : file.selected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
          : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
    >
      <div 
        onClick={() => onToggleSelection(file.file_id)}
        className={`flex items-start justify-between ${
          chatWithData ? 'cursor-pointer' : 'cursor-not-allowed'
        }`}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <FileIcon type={file.file_type} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {file.filename}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatFileSize(file.size)}
            </p>
          </div>
        </div>
        <div className="ml-2">
          {file.selected ? (
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          ) : (
            <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2 mt-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onViewMetadata(file.file_id)
          }}
          disabled={!chatWithData}
          className={`text-xs px-2 py-1 rounded ${
            chatWithData 
              ? 'text-blue-600 hover:text-blue-800 bg-blue-50 dark:bg-blue-900'
              : 'text-gray-400 bg-gray-100 dark:bg-gray-600 cursor-not-allowed'
          }`}
        >
          📊 ดูข้อมูล
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onViewPreview(file.file_id)
          }}
          disabled={!chatWithData}
          className={`text-xs px-2 py-1 rounded ${
            chatWithData
              ? 'text-purple-600 hover:text-purple-800 bg-purple-50 dark:bg-purple-900'
              : 'text-gray-400 bg-gray-100 dark:bg-gray-600 cursor-not-allowed'
          }`}
        >
          👁️ ดูตัวอย่าง
        </button>
      </div>
    </div>
  )
}