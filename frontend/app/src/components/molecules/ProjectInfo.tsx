import { Card } from '../atoms/Card'

interface ProjectData {
  project_id: string
  name: string
  description: string
  created_at: string
}

interface ProjectInfoProps {
  project: ProjectData
}

export const ProjectInfo = ({ project }: ProjectInfoProps) => (
  <Card className="p-4 mb-4">
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      {project.name}
    </h2>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
      {project.description}
    </p>
    <p className="text-xs text-gray-500 dark:text-gray-500">
      สร้างเมื่อ: {new Date(project.created_at).toLocaleDateString('th-TH')}
    </p>
  </Card>
)