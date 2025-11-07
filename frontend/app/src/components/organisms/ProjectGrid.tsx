import { ProjectCard } from '../molecules/ProjectCard'

interface Project {
  project_id: string
  name: string
  description: string
  created_at: string
}

interface ProjectGridProps {
  projects: Project[]
  onSelectProject: (projectId: string, project: Project) => void
  onUpdateProject?: (projectId: string, name: string, description: string) => Promise<boolean>
  onDeleteProject?: (projectId: string) => Promise<boolean>
}

export const ProjectGrid = ({ 
  projects, 
  onSelectProject,
  onUpdateProject,
  onDeleteProject
}: ProjectGridProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {projects.map((project) => (
      <ProjectCard
        key={project.project_id}
        project={project}
        onSelect={onSelectProject}
        onUpdateProject={onUpdateProject}
        onDeleteProject={onDeleteProject}
      />
    ))}
  </div>
)