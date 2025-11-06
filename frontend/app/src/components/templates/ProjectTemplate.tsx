import { ProjectHeader } from '../molecules/ProjectHeader'

interface ProjectData {
  name: string
  description: string
}

interface ProjectTemplateProps {
  project: ProjectData
  onBack: () => void
  children: React.ReactNode
}

export const ProjectTemplate = ({ project, onBack, children }: ProjectTemplateProps) => (
  <div className="min-h-screen bg-white">
    <ProjectHeader project={project} onBack={onBack} />
    {children}
  </div>
)