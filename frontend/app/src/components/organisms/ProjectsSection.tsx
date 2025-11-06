import { useState } from 'react'
import { Button } from '../atoms/Button'
import { CreateProjectForm } from '../molecules/CreateProjectForm'
import { ProjectGrid } from './ProjectGrid'

interface Project {
  project_id: string
  name: string
  description: string
  created_at: string
  updated_at: string
}

interface ProjectsSectionProps {
  projects: Project[]
  onSelectProject: (projectId: string, project: Project) => void
  onCreateProject: (name: string, description: string) => Promise<boolean>
}

export const ProjectsSection = ({ projects, onSelectProject, onCreateProject }: ProjectsSectionProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false)

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h2 className="text-xl mb-6">My Projects</h2>
      
      <ProjectGrid projects={projects} onSelectProject={onSelectProject} />
      
      <button 
        onClick={() => setShowCreateForm(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gray-400 hover:bg-gray-600 text-white rounded-full flex items-center justify-center text-2xl shadow-lg"
      >
        +
      </button>

      {showCreateForm && (
        <CreateProjectForm
          onSubmit={onCreateProject}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  )
}