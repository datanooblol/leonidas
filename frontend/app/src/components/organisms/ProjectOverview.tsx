import { StatsGrid } from '../molecules/StatsGrid'
import { SessionManager } from './SessionManager'
import { FileManager } from './FileManager'

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

interface ProjectOverviewProps {
  project: ProjectData
  sessions: SessionData[]
  files: FileData[]
  currentSessionId: string | null
  onSessionSelect: (sessionId: string) => void
  onSessionsUpdate: (sessions: SessionData[]) => void
  onFilesUpdate: (files: FileData[]) => void
}

export const ProjectOverview = ({ 
  project, 
  sessions, 
  files, 
  currentSessionId, 
  onSessionSelect, 
  onSessionsUpdate, 
  onFilesUpdate 
}: ProjectOverviewProps) => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SessionManager
        projectId={project.project_id}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSessionSelect={onSessionSelect}
        onSessionsUpdate={onSessionsUpdate}
      />

      <FileManager
        projectId={project.project_id}
        files={files}
        onFilesUpdate={onFilesUpdate}
      />
    </div>

    <StatsGrid
      sessionsCount={sessions.length}
      filesCount={files.length}
      createdDate={project.created_at}
    />
  </div>
)