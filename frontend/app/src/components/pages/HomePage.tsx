'use client'
import { useState, useEffect } from 'react'
import { DashboardTemplate } from '../templates/DashboardTemplate'
import { ProjectsSection } from '../organisms/ProjectsSection'
import { Spinner } from '../atoms/Spinner'
import { apiService } from '../../../lib/api'

interface Project {
  project_id: string
  name: string
  description: string
  created_at: string
  updated_at: string
}

interface HomePageProps {
  userEmail: string
  onSelectProject: (projectId: string, project: Project) => void
  onLogout: () => void
}

export const HomePage = ({ userEmail, onSelectProject, onLogout }: HomePageProps) => {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const projectsData = await apiService.getProjects()
      setProjects(projectsData)
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProject = async (name: string, description: string) => {
    try {
      const newProject = await apiService.createProject(name, description)
      setProjects(prev => [newProject, ...prev])
      return true
    } catch (error) {
      console.error('Failed to create project:', error)
      return false
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <DashboardTemplate userEmail={userEmail} onLogout={onLogout}>
      <ProjectsSection
        projects={projects}
        onSelectProject={onSelectProject}
        onCreateProject={handleCreateProject}
      />
    </DashboardTemplate>
  )
}