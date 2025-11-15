interface UploadStatusProps {
  show: boolean
}

export const UploadStatus = ({ show }: UploadStatusProps) => {
  if (!show) return null

  return (
    <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
      <p className="text-sm text-green-800 dark:text-green-200">✅ อัปโหลดไฟล์สำเร็จแล้ว</p>
    </div>
  )
}