import { useState } from 'react'
import { Button } from '../atoms/Button'
import { Heading } from '../atoms/Heading'
import { CreateProjectForm } from '../molecules/CreateProjectForm'
import { ProjectGrid } from './ProjectGrid'

interface Project {
  project_id: string
  name: string
  description: string
  created_at: string
}

interface ProjectsSectionProps {
  projects: Project[]
  onSelectProject: (projectId: string, project: Project) => void
  onCreateProject: (name: string, description: string) => Promise<boolean>
}

export const ProjectsSection = ({ projects, onSelectProject, onCreateProject }: ProjectsSectionProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Heading className="text-xl">My Projects</Heading>
        <Button onClick={() => setShowCreateForm(true)} className="w-auto">
          + New Project
        </Button>
      </div>

      {showCreateForm && (
        <CreateProjectForm
          onSubmit={onCreateProject}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <ProjectGrid projects={projects} onSelectProject={onSelectProject} />
    </div>
  )
}