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
  <div className="bg-gray-100 shadow-sm border-b border-gray-300">
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex items-center space-x-4">
        <Button 
          onClick={onBack}
          variant="secondary"
          className="w-auto text-gray-600 hover:text-gray-900"
        >
          ← กลับ
        </Button>
        <div>
          <Heading className="text-2xl">{project.name}</Heading>
          <p className="text-sm text-gray-600">{project.description}</p>
        </div>
      </div>
    </div>
  </div>
)