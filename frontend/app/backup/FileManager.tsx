import { useState, useRef } from 'react'
import { apiService } from '../lib/api'
import MetadataModal from './MetadataModal'

interface FileData {
  file_id: string
  project_id: string
  filename: string
  size: number
  file_type: string
  created_at: string
}

interface FileMetadata {
  file_id: string
  filename: string
  size: number
  name?: string
  description?: string
  columns?: ColumnMetadata[]
}

interface ColumnMetadata {
  column: string
  dtype: string
  input_type: string
  description?: string
  summary?: string
}

interface FileManagerProps {
  projectId: string
  files: FileData[]
  onFilesUpdate: (files: FileData[]) => void
}

export default function FileManager({ projectId, files, onFilesUpdate }: FileManagerProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [showMetadata, setShowMetadata] = useState<string | null>(null)
  const [fileMetadata, setFileMetadata] = useState<Record<string, FileMetadata>>({})
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

    console.log('🚀 Starting file upload process')
    console.log('📁 Selected files:', Array.from(selectedFiles).map(f => ({ name: f.name, size: f.size, type: f.type })))
    console.log('🎯 Project ID:', projectId)

    setIsUploading(true)
    setUploadSuccess(false)

    try {
      for (const file of Array.from(selectedFiles)) {
        console.log(`📤 Uploading file: ${file.name} (${file.size} bytes)`)
        await apiService.uploadFile(projectId, file)
        console.log(`✅ Successfully uploaded: ${file.name}`)
      }

      console.log('🔄 Refreshing file list...')
      const updatedFiles = await apiService.getFiles(projectId)
      console.log('📋 Updated files:', updatedFiles.length, 'files')
      onFilesUpdate(updatedFiles)
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)
      console.log('🎉 Upload process completed successfully')
    } catch (error) {
      console.error('❌ Upload failed:', error)
      console.error('📊 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      alert('การอัปโหลดไฟล์ไม่สำเร็จ')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteFile = async (fileId: string, filename: string) => {
    if (!confirm(`ต้องการลบไฟล์ "${filename}" หรือไม่?`)) return

    try {
      await apiService.deleteFile(fileId)
      const updatedFiles = await apiService.getFiles(projectId)
      onFilesUpdate(updatedFiles)
    } catch (error) {
      console.error('Delete failed:', error)
      alert('ลบไฟล์ไม่สำเร็จ')
    }
  }

  const loadFileMetadata = async (fileId: string) => {
    try {
      const metadata = await apiService.getFileMetadata(fileId)
      setFileMetadata(prev => ({ ...prev, [fileId]: metadata }))
    } catch (error) {
      console.error('Failed to load metadata:', error)
      alert('ไม่สามารถโหลด metadata ได้')
    }
  }

  const handleMetadataSave = (updatedMetadata: FileMetadata) => {
    setFileMetadata(prev => ({ ...prev, [updatedMetadata.file_id]: updatedMetadata }))
    console.log('Updated metadata:', updatedMetadata)
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

      {uploadSuccess && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">✅ อัปโหลดไฟล์สำเร็จแล้ว</p>
        </div>
      )}

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
                  {file.size ? formatFileSize(file.size) : 'Unknown size'} • {new Date(file.created_at).toLocaleDateString('th-TH')}
                </p>
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center space-x-2">
                <span>{file.file_type}</span>
                <button
                  onClick={() => {
                    loadFileMetadata(file.file_id)
                    setShowMetadata(file.file_id)
                  }}
                  className="text-blue-500 hover:text-blue-700"
                  title="ดู metadata"
                >
                  📊
                </button>
                <button
                  onClick={() => handleDeleteFile(file.file_id, file.filename)}
                  className="text-red-500 hover:text-red-700"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Metadata Modal */}
      {showMetadata && fileMetadata[showMetadata] && (
        <MetadataModal
          metadata={fileMetadata[showMetadata]}
          onClose={() => setShowMetadata(null)}
          onSave={handleMetadataSave}
        />
      )}
    </div>
  )
}