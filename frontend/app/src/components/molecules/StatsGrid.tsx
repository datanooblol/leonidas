import { Card } from '../atoms/Card'

interface StatsGridProps {
  sessionsCount: number
  filesCount: number
  createdDate: string
}

export const StatsGrid = ({ sessionsCount, filesCount, createdDate }: StatsGridProps) => (
  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card>
      <div className="text-2xl font-bold text-blue-600">{sessionsCount}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">Chat Sessions</div>
    </Card>
    
    <Card>
      <div className="text-2xl font-bold text-green-600">{filesCount}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">ไฟล์ที่อัปโหลด</div>
    </Card>
    
    <Card>
      <div className="text-2xl font-bold text-purple-600">
        {new Date(createdDate).toLocaleDateString('th-TH')}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">วันที่สร้าง</div>
    </Card>
  </div>
)