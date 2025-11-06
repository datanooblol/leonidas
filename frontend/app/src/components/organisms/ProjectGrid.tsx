import { ProjectCard } from '../molecules/ProjectCard'
import { EmptyState } from '../molecules/EmptyState'

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

export const ProjectGrid = ({ projects, onSelectProject }: ProjectGridProps) => {
  if (projects.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.project_id}
          project={project}
          onSelect={onSelectProject}
        />
      ))}
    </div>
  )
}