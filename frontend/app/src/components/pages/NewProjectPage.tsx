'use client'
import { useState, useEffect } from 'react'
import { ProjectLayoutTemplate } from '../templates/ProjectLayoutTemplate'
import { ProjectInfo } from '../molecules/ProjectInfo'
import { TabSwitcher } from '../molecules/TabSwitcher'
import { FileManager } from '../organisms/FileManager'
import { SessionManager } from '../organisms/SessionManager'
import { ChatContainer } from '../organisms/ChatContainer'
import { MetadataModal } from '../organisms/MetadataModal'
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
  size: number
  file_type: string
  created_at: string
}

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  artifacts?: any[]
}

interface NewProjectPageProps {
  project: ProjectData
  onBack: () => void
}

export const NewProjectPage = ({ project, onBack }: NewProjectPageProps) => {
  const [activeTab, setActiveTab] = useState<'files' | 'sessions'>('files')
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [files, setFiles] = useState<FileData[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showMetadata, setShowMetadata] = useState<string | null>(null)
  const [fileMetadata, setFileMetadata] = useState<Record<string, any>>({})

  useEffect(() => {
    loadProjectData()
  }, [project.project_id])

  useEffect(() => {
    if (currentSessionId) {
      loadChatHistory()
    } else {
      setMessages([])
    }
  }, [currentSessionId])

  const loadProjectData = async () => {
    try {
      const [sessionsData, filesData] = await Promise.all([
        apiService.getSessions(project.project_id),
        apiService.getFiles(project.project_id)
      ])
      
      setSessions(sessionsData)
      setFiles(filesData)
    } catch (error) {
      console.error('Failed to load project data:', error)
    }
  }

  const loadChatHistory = async () => {
    if (!currentSessionId) return
    
    try {
      const history = await apiService.getChatHistory(currentSessionId)
      const formattedMessages: Message[] = (history.messages || []).map(msg => ({
        id: msg.message_id,
        content: msg.content,
        role: msg.role,
        timestamp: new Date(msg.created_at),
        artifacts: msg.artifacts
      }))
      
      setMessages(formattedMessages)
    } catch (error) {
      console.error('Error loading chat history:', error)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !currentSessionId) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const messageContent = input
    setInput('')
    setIsLoading(true)

    try {
      const response = await apiService.sendMessage(currentSessionId, messageContent, true)
      const assistantMessage: Message = {
        id: response.id,
        content: response.content,
        role: 'assistant',
        timestamp: new Date(),
        artifacts: response.artifacts
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId)
  }

  const handleMetadataView = (fileId: string) => {
    setShowMetadata(fileId)
  }

  const loadFileMetadata = async (fileId: string) => {
    try {
      const metadata = await apiService.getFileMetadata(fileId)
      setFileMetadata(prev => ({ ...prev, [fileId]: metadata }))
    } catch (error) {
      console.error('Failed to load metadata:', error)
    }
  }

  const leftPanel = (
    <>
      <ProjectInfo project={project} />
      <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
      
      {activeTab === 'files' ? (
        <FileManager
          projectId={project.project_id}
          files={files}
          onFilesUpdate={setFiles}
        />
      ) : (
        <SessionManager
          projectId={project.project_id}
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSessionSelect={handleSessionSelect}
          onSessionsUpdate={setSessions}
        />
      )}
    </>
  )

  const rightPanel = (
    <ChatContainer
      messages={messages}
      input={input}
      isLoading={isLoading}
      sessionId={currentSessionId}
      onInputChange={setInput}
      onSendMessage={sendMessage}
    />
  )

  return (
    <>
      <ProjectLayoutTemplate
        projectName={project.name}
        leftPanel={leftPanel}
        rightPanel={rightPanel}
        onBack={onBack}
      />

      {showMetadata && fileMetadata[showMetadata] && (
        <MetadataModal
          metadata={fileMetadata[showMetadata]}
          onClose={() => setShowMetadata(null)}
          onSave={(metadata) => setFileMetadata(prev => ({ ...prev, [metadata.file_id]: metadata }))}
        />
      )}
    </>
  )
}