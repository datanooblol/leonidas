import { Card } from '../atoms/Card'

interface Project {
  project_id: string
  name: string
  description: string
  created_at: string
}

interface ProjectCardProps {
  project: Project
  onSelect: (projectId: string, project: Project) => void
}

export const ProjectCard = ({ project, onSelect }: ProjectCardProps) => (
  <Card onClick={() => onSelect(project.project_id, project)}>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      {project.name}
    </h3>
    <p className="text-gray-600 text-sm mb-4">
      {project.description || 'ไม่มีคำอธิบาย'}
    </p>
    <div className="flex justify-between text-sm text-gray-600">
      <span>สร้างเมื่อ</span>
      <span>{new Date(project.created_at).toLocaleDateString('th-TH')}</span>
    </div>
  </Card>
)