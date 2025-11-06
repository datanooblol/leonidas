import { Button } from '../atoms/Button'

interface ChatHeaderProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
  onBack: () => void
  chatWithData: boolean
  selectedFilesCount: number
}

export const ChatHeader = ({ 
  sidebarOpen, 
  onToggleSidebar, 
  onBack, 
  chatWithData, 
  selectedFilesCount 
}: ChatHeaderProps) => (
  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
    <div className="flex items-center space-x-3">
      <Button
        onClick={onToggleSidebar}
        variant="secondary"
        className="w-auto p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        {sidebarOpen ? '◀' : '▶'}
      </Button>
      <Button
        onClick={onBack}
        variant="secondary"
        className="w-auto p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        ← กลับ
      </Button>
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          DS Bro - AI Data Scientist
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {chatWithData 
            ? selectedFilesCount > 0 
              ? `ใช้ข้อมูลจาก ${selectedFilesCount} ไฟล์` 
              : 'พร้อมช่วยวิเคราะห์ข้อมูล'
            : 'โหมดแชทธรรมดา'
          }
        </p>
      </div>
    </div>
  </div>
)