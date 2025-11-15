import { useRef } from 'react'
import { Button } from '../atoms/Button'

interface FileUploadButtonProps {
  onFileUpload: (files: FileList) => void
  isUploading: boolean
}

export const FileUploadButton = ({ onFileUpload, isUploading }: FileUploadButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      onFileUpload(files)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
        accept=".txt,.pdf,.doc,.docx,.json,.csv,.md,.py,.js,.ts"
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="px-3 py-2 text-sm w-auto"
      >
        {isUploading ? 'กำลังอัปโหลด...' : '📁 อัปโหลดไฟล์'}
      </Button>
    </>
  )
}