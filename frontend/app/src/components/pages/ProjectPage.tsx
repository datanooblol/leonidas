'use client'
import { useState, useEffect } from 'react'
import { ProjectTemplate } from '../templates/ProjectTemplate'
import { ProjectContent } from '../organisms/ProjectContent'
import { Spinner } from '../atoms/Spinner'
import { apiService } from '../../../lib/api'

interface ProjectData {
  project_id: string
  name: string
  description: string
  created_at: string
  updated_at: string
}

interface SessionData {
  session_id: string
  project_id: string
  name: string
  created_at: string
  updated_at: string
}

interface FileData {
  file_id: string
  project_id: string
  filename: string
  file_size: number
  file_type: string
  created_at: string
}

interface ProjectPageProps {
  project: ProjectData
  onBack: () => void
}

export const ProjectPage = ({ project, onBack }: ProjectPageProps) => {
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [files, setFiles] = useState<FileData[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'chat'>('overview')

  useEffect(() => {
    loadProjectData()
  }, [project.project_id])

  const loadProjectData = async () => {
    try {
      const [sessionsData, filesData] = await Promise.all([
        apiService.getSessions(project.project_id),
        apiService.getFiles(project.project_id)
      ])
      
      setSessions(sessionsData)
      setFiles(filesData)
      
      if (sessionsData.length > 0) {
        setCurrentSessionId(sessionsData[0].session_id)
      }
    } catch (error) {
      console.error('Failed to load project data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Spinner text="กำลังโหลดข้อมูลโปรเจค..." />
      </div>
    )
  }

  return (
    <ProjectTemplate project={project} onBack={onBack}>
      <ProjectContent
        project={project}
        sessions={sessions}
        files={files}
        currentSessionId={currentSessionId}
        activeTab={activeTab}
        onSessionSelect={setCurrentSessionId}
        onSessionsUpdate={setSessions}
        onFilesUpdate={setFiles}
        onTabChange={setActiveTab}
      />
    </ProjectTemplate>
  )
}