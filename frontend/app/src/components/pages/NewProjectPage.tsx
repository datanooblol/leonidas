'use client'
import { useState, useEffect } from 'react'
import { ChatTemplate } from '../templates/ChatTemplate'
import { ProjectChatSidebar } from '../organisms/ProjectChatSidebar'
import { ChatArea } from '../organisms/ChatArea'
import { UploadStatus } from '../molecules/UploadStatus'
import { NewChatModal } from '../molecules/NewChatModal'
import { FileMetadataModal } from '../organisms/FileMetadataModal'
import { apiService, getLastUsedModel } from '../../../lib/api'

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
  selected?: boolean
}

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  artifacts?: any[]
}

interface Column {
  column: string
  dtype: string
  input_type: string
  description: string | null
  summary: string | null
}

interface FileMetadata {
  file_id: string
  project_id: string
  filename: string
  size: number
  status: string
  source: string
  selected: boolean
  created_at: string
  updated_at: string
  name: string
  description: string
  columns: Column[]
}

interface NewProjectPageProps {
  project: ProjectData
  onBack: () => void
}

export const NewProjectPage = ({ project, onBack }: NewProjectPageProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [useFileData, setUseFileData] = useState(false)
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [files, setFiles] = useState<FileData[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showUploadStatus, setShowUploadStatus] = useState(false)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const [showMetadataModal, setShowMetadataModal] = useState(false)
  const [currentMetadata, setCurrentMetadata] = useState<FileMetadata | null>(null)
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState<string>("OPENAI_20b_BR")

  useEffect(() => {
    loadProjectData()
    loadAvailableModels()
  }, [project.project_id])

  useEffect(() => {
    if (currentSessionId) {
      loadChatHistory()
    } else {
      setMessages([])
    }
  }, [currentSessionId])

  // Update selected model when chat history loads
  useEffect(() => {
    if (messages.length > 0 && availableModels.length > 0) {
      const lastModel = getLastUsedModel(messages.map(msg => ({
        message_id: msg.id,
        content: msg.content,
        role: msg.role,
        created_at: msg.timestamp.toISOString(),
        model_name: (msg as any).model_name
      })), availableModels)
      setSelectedModel(lastModel)
    }
  }, [messages, availableModels])

  // Clear selected files when useFileData is turned off
  useEffect(() => {
    if (!useFileData) {
      setSelectedFiles([])
      setFiles(prev => prev.map(file => ({ ...file, selected: false })))
    }
  }, [useFileData])

  // Sync selectedFiles with files selected property
  useEffect(() => {
    const selectedIds = files.filter(file => file.selected).map(file => file.file_id)
    setSelectedFiles(selectedIds)
  }, [files])

  const loadProjectData = async () => {
    try {
      const [sessionsData, filesData] = await Promise.all([
        apiService.getSessions(project.project_id),
        apiService.getFiles(project.project_id)
      ])
      
      setSessions(sessionsData)
      // Use selected property from API response
      const filesWithSelection = filesData.map(file => ({
        ...file,
        selected: file.selected === true // Ensure boolean value
      }))
      setFiles(filesWithSelection)
    } catch (error) {
      console.error('Failed to load project data:', error)
    }
  }

  const loadAvailableModels = async () => {
    try {
      const data = await apiService.getAvailableModels()
      setAvailableModels(data.models)
      if (data.models.length > 0 && !selectedModel) {
        setSelectedModel(data.models[0])
      }
    } catch (error) {
      console.error('Failed to load available models:', error)
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
        model_name: msg.model_name
      } as any))
      
      setMessages(formattedMessages)
    } catch (error) {
      console.error('Error loading chat history:', error)
    }
  }

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const handleFileSelect = async (fileId: string) => {
    if (!useFileData) return
    
    const file = files.find(f => f.file_id === fileId)
    if (!file) return
    
    const newSelected = !file.selected
    
    try {
      await apiService.updateFileSelection(fileId, newSelected)
      
      setFiles(prev => prev.map(f => 
        f.file_id === fileId 
          ? { ...f, selected: newSelected }
          : f
      ))
    } catch (error) {
      console.error('Failed to update file selection:', error)
    }
  }

  const handleToggleFileData = () => {
    setUseFileData(!useFileData)
  }

  const handleFileUpload = async (fileList: FileList) => {
    setIsUploading(true)
    
    try {
      const uploadPromises = Array.from(fileList).map(file => 
        apiService.uploadFile(project.project_id, file)
      )
      
      await Promise.all(uploadPromises)
      
      // Reload files after upload
      const filesData = await apiService.getFiles(project.project_id)
      const filesWithSelection = filesData.map(file => ({
        ...file,
        selected: file.selected === true // Ensure boolean value
      }))
      setFiles(filesWithSelection)
      
      setShowUploadStatus(true)
      setTimeout(() => setShowUploadStatus(false), 3000)
      
    } catch (error) {
      console.error('Failed to upload files:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleNewChat = () => {
    setShowNewChatModal(true)
  }

  const handleCreateChat = async (chatName: string) => {
    setIsCreatingChat(true)
    
    try {
      const newSession = await apiService.createSession(project.project_id, chatName)
      setSessions(prev => [newSession, ...prev])
      setCurrentSessionId(newSession.session_id)
      setMessages([])
      setInput('')
      setShowNewChatModal(false)
    } catch (error) {
      console.error('Failed to create session:', error)
    } finally {
      setIsCreatingChat(false)
    }
  }

  const handleUpdateSession = async (sessionId: string, name: string) => {
    try {
      const updatedSession = await apiService.updateSession(sessionId, name)
      setSessions(prev => prev.map(s => 
        s.session_id === sessionId ? { ...s, name: updatedSession.name } : s
      ))
    } catch (error) {
      console.error('Failed to update session:', error)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await apiService.deleteSession(sessionId)
      setSessions(prev => prev.filter(s => s.session_id !== sessionId))
      
      // If deleting current session, clear it
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null)
        setMessages([])
      }
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }

  const handleViewMetadata = async (fileId: string) => {
    try {
      const metadata = await apiService.getFileMetadata(fileId)
      setCurrentMetadata(metadata)
      setShowMetadataModal(true)
    } catch (error) {
      console.error('Failed to get metadata:', error)
      alert('Failed to load file metadata')
    }
  }

  const handleSaveMetadata = async (metadata: FileMetadata) => {
    try {
      await apiService.updateFileMetadata(metadata.file_id, metadata)
      console.log('Metadata updated successfully')
    } catch (error) {
      console.error('Failed to update metadata:', error)
      alert('Failed to save metadata')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_email')
    window.location.href = '/login'
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
      const response = await apiService.sendMessage(currentSessionId, messageContent, useFileData, selectedModel)
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

  const userEmail = localStorage.getItem('user_email') 

  return (
    <>
      <UploadStatus show={showUploadStatus} />
      <NewChatModal
        show={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onCreateChat={handleCreateChat}
        isCreating={isCreatingChat}
      />
      <FileMetadataModal
        metadata={currentMetadata}
        onClose={() => {
          setShowMetadataModal(false)
          setCurrentMetadata(null)
        }}
        onSave={handleSaveMetadata}
      />
      <ChatTemplate
        sidebar={
          <ProjectChatSidebar
            collapsed={sidebarCollapsed}
            selectedFiles={selectedFiles}
            files={files}
            sessions={sessions}
            currentSessionId={currentSessionId}
            userEmail={userEmail}
            isUploading={isUploading}
            useFileData={useFileData}
            onFileSelect={handleFileSelect}
            onNewChat={handleNewChat}
            onToggleSidebar={handleToggleSidebar}
            onSessionSelect={handleSessionSelect}
            onLogout={handleLogout}
            onFileUpload={handleFileUpload}
            onUpdateSession={handleUpdateSession}
            onDeleteSession={handleDeleteSession}
            onViewMetadata={handleViewMetadata}
          />
        }
        chatArea={
          <ChatArea
            messages={messages}
            input={input}
            isLoading={isLoading}
            currentSession={currentSessionId}
            selectedFilesCount={selectedFiles.length}
            useFileData={useFileData}
            onInputChange={setInput}
            onSendMessage={sendMessage}
            onToggleSidebar={handleToggleSidebar}
            onToggleFileData={handleToggleFileData}
            onBack={onBack}
            selectedModel={selectedModel}
            availableModels={availableModels}
            onModelChange={setSelectedModel}
          />
        }
      />
    </>
  )
}