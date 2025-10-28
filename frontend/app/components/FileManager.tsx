import { useState, useRef } from 'react'
import { apiService } from '../lib/api'

interface FileData {
  file_id: string
  project_id: string
  filename: string
  file_size: number
  file_type: string
  created_at: string
}

interface FileManagerProps {
  projectId: string
  files: FileData[]
  onFilesUpdate: (files: FileData[]) => void
}

export default function FileManager({ projectId, files, onFilesUpdate }: FileManagerProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (!selectedFiles) return

    setIsUploading(true)

    try {
      for (const file of Array.from(selectedFiles)) {
        await apiService.uploadFile(projectId, file)
      }

      // Refresh file list
      const updatedFiles = await apiService.getFiles(projectId)
      onFilesUpdate(updatedFiles)
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert('การอัปโหลดไฟล์ไม่สำเร็จ')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">ไฟล์เอกสาร</h3>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept=".txt,.pdf,.doc,.docx,.json,.csv,.md,.py,.js,.ts"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm"
          >
            {isUploading ? 'กำลังอัปโหลด...' : '📁 อัปโหลดไฟล์'}
          </button>
        </div>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-3xl mb-2">📄</div>
          <p className="text-sm">ยังไม่มีไฟล์</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div key={file.file_id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {file.filename}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString('th-TH')}
                </p>
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                {file.file_type}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}