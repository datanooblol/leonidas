import { Button } from '../atoms/Button'
import { Heading } from '../atoms/Heading'

interface ProjectData {
  name: string
  description: string
}

interface ProjectHeaderProps {
  project: ProjectData
  onBack: () => void
}

export const ProjectHeader = ({ project, onBack }: ProjectHeaderProps) => (
  <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex items-center space-x-4">
        <Button 
          onClick={onBack}
          variant="secondary"
          className="w-auto text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          ← กลับ
        </Button>
        <div>
          <Heading className="text-2xl">{project.name}</Heading>
          <p className="text-sm text-gray-600 dark:text-gray-400">{project.description}</p>
        </div>
      </div>
    </div>
  </div>
)