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
  onUpdateProject?: (projectId: string, name: string, description: string) => Promise<boolean>
  onDeleteProject?: (projectId: string) => Promise<boolean>
}

export const ProjectsSection = ({ 
  projects, 
  onSelectProject, 
  onCreateProject,
  onUpdateProject,
  onDeleteProject
}: ProjectsSectionProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false)

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-6 py-8">
        <h2 className="text-xl mb-6">My Projects</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <ProjectGrid 
            projects={projects} 
            onSelectProject={onSelectProject}
            onUpdateProject={onUpdateProject}
            onDeleteProject={onDeleteProject}
          />
        </div>
      </div>
      
      <button 
        onClick={() => setShowCreateForm(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gray-400 hover:bg-gray-600 text-white rounded-full flex items-center justify-center text-2xl shadow-lg z-10"
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