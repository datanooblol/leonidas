import { Card } from '../atoms/Card'

interface Project {
  project_id: string
  name: string
  description: string
  created_at: string
}

interface ProjectGridProps {
  projects: Project[]
  onSelectProject: (projectId: string, project: Project) => void
}

export const ProjectGrid = ({ projects, onSelectProject }: ProjectGridProps) => (
  <div className="grid grid-cols-3 gap-6">
    {projects.map((project) => (
      <Card 
        key={project.project_id}
        onClick={() => onSelectProject(project.project_id, project)}
        className="h-24 flex items-center justify-center border"
      >
        <span>{project.name}</span>
      </Card>
    ))}
  </div>
)