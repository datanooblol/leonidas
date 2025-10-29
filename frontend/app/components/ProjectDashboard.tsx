import { useState, useEffect } from 'react'
import { apiService } from '../lib/api'
import SessionManager from './SessionManager'
import FileManager from './FileManager'
import NotebookChat from './NotebookChat'

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

interface ProjectDashboardProps {
  project: ProjectData
  onBack: () => void
}

export default function ProjectDashboard({ project, onBack }: ProjectDashboardProps) {
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
      
      // Auto-select first session if available
      if (sessionsData.length > 0) {
        setCurrentSessionId(sessionsData[0].session_id)
      }
    } catch (error) {
      console.error('Failed to load project data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId)
    setActiveTab('chat')
  }

  const handleSessionsUpdate = (updatedSessions: SessionData[]) => {
    setSessions(updatedSessions)
  }

  const handleFilesUpdate = (updatedFiles: FileData[]) => {
    setFiles(updatedFiles)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">กำลังโหลดข้อมูลโปรเจค...</p>
        </div>
      </div>
    )
  }

  if (activeTab === 'chat' && currentSessionId) {
    return (
      <NotebookChat
        projectId={project.project_id}
        sessionId={currentSessionId}
        onBack={() => setActiveTab('overview')}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              ← กลับ
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">{project.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sessions */}
          <SessionManager
            projectId={project.project_id}
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSessionSelect={handleSessionSelect}
            onSessionsUpdate={handleSessionsUpdate}
          />

          {/* Files */}
          <FileManager
            projectId={project.project_id}
            files={files}
            onFilesUpdate={handleFilesUpdate}
          />
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-blue-600">{sessions.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Chat Sessions</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-green-600">{files.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">ไฟล์ที่อัปโหลด</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-purple-600">
              {new Date(project.created_at).toLocaleDateString('th-TH')}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">วันที่สร้าง</div>
          </div>
        </div>
      </div>
    </div>
  )
}