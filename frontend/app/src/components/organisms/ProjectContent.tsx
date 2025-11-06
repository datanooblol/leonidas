import { ProjectOverview } from './ProjectOverview'
import { ChatPage } from '../pages/ChatPage'

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

interface ProjectData {
  project_id: string
  name: string
  description: string
  created_at: string
  updated_at: string
}

interface ProjectContentProps {
  project: ProjectData
  sessions: SessionData[]
  files: FileData[]
  currentSessionId: string | null
  activeTab: 'overview' | 'chat'
  onSessionSelect: (sessionId: string) => void
  onSessionsUpdate: (sessions: SessionData[]) => void
  onFilesUpdate: (files: FileData[]) => void
  onTabChange: (tab: 'overview' | 'chat') => void
}

export const ProjectContent = ({
  project,
  sessions,
  files,
  currentSessionId,
  activeTab,
  onSessionSelect,
  onSessionsUpdate,
  onFilesUpdate,
  onTabChange
}: ProjectContentProps) => {
  if (activeTab === 'chat' && currentSessionId) {
    return (
      <ChatPage
        projectId={project.project_id}
        sessionId={currentSessionId}
        onBack={() => onTabChange('overview')}
      />
    )
  }

  return (
    <ProjectOverview
      project={project}
      sessions={sessions}
      files={files}
      currentSessionId={currentSessionId}
      onSessionSelect={(sessionId) => {
        onSessionSelect(sessionId)
        onTabChange('chat')
      }}
      onSessionsUpdate={onSessionsUpdate}
      onFilesUpdate={onFilesUpdate}
    />
  )
}