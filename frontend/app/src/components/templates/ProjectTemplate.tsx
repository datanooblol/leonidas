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
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <ProjectHeader project={project} onBack={onBack} />
    {children}
  </div>
)