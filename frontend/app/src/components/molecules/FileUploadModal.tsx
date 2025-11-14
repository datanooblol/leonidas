import { useState, useRef } from 'react'
import { Modal } from '../atoms/Modal'

interface FileUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (files: FileList) => void
  isUploading: boolean
}

export const FileUploadModal = ({ isOpen, onClose, onUpload, isUploading }: FileUploadModalProps) => {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files)
    }
  }

  if (!isOpen) return null

  return (
    <Modal onClose={onClose}>
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-xs sm:max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Upload Files</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isUploading}
          >
            ✕
          </button>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-2 sm:space-y-4">
            <div className="text-2xl sm:text-4xl">📁</div>
            <div>
              <p className="text-sm sm:text-base text-gray-600 mb-2">
                {isUploading ? 'Uploading...' : 'Drag and drop files here'}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4">or</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 sm:px-4 text-sm sm:text-base bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                disabled={isUploading}
              >
                Browse Files
              </button>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept=".txt,.pdf,.doc,.docx,.json,.csv,.md,.py,.js,.ts"
        />

        <p className="text-xs text-gray-500 mt-3 sm:mt-4 text-center sm:text-left">
          Supported: .txt, .pdf, .doc, .docx, .json, .csv, .md, .py, .js, .ts
        </p>
      </div>
    </Modal>
  )
}