import { Icon } from '../atoms/Icon'
import { Heading } from '../atoms/Heading'

export const EmptyState = () => (
  <div className="text-center py-12">
    <div className="mb-4">
      <Icon type="folder" />
    </div>
    <Heading className="text-lg mb-2">ยังไม่มีโปรเจค</Heading>
    <p className="text-gray-600 dark:text-gray-400">
      เริ่มต้นด้วยการสร้างโปรเจคแรกของคุณ
    </p>
  </div>
)