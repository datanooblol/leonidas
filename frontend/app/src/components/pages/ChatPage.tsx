'use client'
import { useState, useEffect } from 'react'
import { ChatTemplate } from '../templates/ChatTemplate'
import { ChatArea } from '../organisms/ChatArea'
import { ProjectChatSidebar } from '../organisms/ProjectChatSidebar'
import { MetadataModal } from '../organisms/MetadataModal'
import { apiService } from '../../../lib/api'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  artifacts?: any[]
}

interface FileData {
  file_id: string
  project_id: string
  filename: string
  size: number
  file_type?: string
  status: string
  source: string
  selected: boolean
  created_at: string
}

interface FileMetadata {
  file_id: string
  filename: string
  file_type: string
  rows?: number
  columns?: any[]
  preview?: Record<string, any>[]
}

interface ChatPageProps {
  projectId: string
  sessionId: string
  onBack: () => void
}

export const ChatPage = ({ projectId, sessionId, onBack }: ChatPageProps) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [files, setFiles] = useState<FileData[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [fileMetadata, setFileMetadata] = useState<Record<string, FileMetadata>>({})
  const [showMetadata, setShowMetadata] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState<string | null>(null)
  const [chatWithData, setChatWithData] = useState(false)

  useEffect(() => {
    loadData()
  }, [sessionId, projectId])

  const loadData = async () => {
    try {
      const [history, filesData] = await Promise.all([
        apiService.getChatHistory(sessionId),
        apiService.getFiles(projectId)
      ])
      
      const formattedMessages: Message[] = (history.messages || []).map(msg => ({
        id: msg.message_id,
        content: msg.content,
        role: msg.role,
        timestamp: new Date(msg.created_at)      }))
      
      setMessages(formattedMessages)
      setFiles(filesData)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const loadFileMetadata = async (fileId: string) => {
    try {
      const metadata = await apiService.getFileMetadata(fileId)
      setFileMetadata(prev => ({ ...prev, [fileId]: metadata }))
    } catch (error) {
      console.error('Failed to load metadata:', error)
    }
  }

  const handleMetadataSave = (updatedMetadata: FileMetadata) => {
    setFileMetadata(prev => ({ ...prev, [updatedMetadata.file_id]: updatedMetadata }))
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

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
      const response = await apiService.sendMessage(sessionId, messageContent, chatWithData)
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

  const handleViewMetadata = (fileId: string) => {
    loadFileMetadata(fileId)
    setShowMetadata(fileId)
  }

  const handleViewPreview = (fileId: string) => {
    loadFileMetadata(fileId)
    setShowPreview(fileId)
  }

  const selectedFilesCount = files.filter(f => f.selected).length

  return (
    <>
      <ChatTemplate
        sidebar={
          <ProjectChatSidebar
            collapsed={!sidebarOpen}
            selectedFiles={files.filter(f => f.selected).map(f => f.file_id)}
            files={files.map(f => ({ ...f, size: f.size || 0 }))}
            sessions={[]}
            currentSessionId={sessionId}
            userEmail="user@example.com"
            isUploading={false}
            useFileData={chatWithData}
            onFileSelect={() => {}}
            onNewChat={() => {}}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onSessionSelect={() => {}}
            onLogout={() => {}}
            onFileUpload={() => {}}
            onViewMetadata={handleViewMetadata}
          />
        }
        chatArea={
          <ChatArea
            messages={messages}
            input={input}
            isLoading={isLoading}
            currentSession={sessionId}
            selectedFilesCount={selectedFilesCount}
            useFileData={chatWithData}
            onInputChange={setInput}
            onSendMessage={sendMessage}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onToggleFileData={setChatWithData}
            onBack={onBack}
          />
        }
      />

      {/* Metadata Modal */}
      {showMetadata && fileMetadata[showMetadata] && (
        <MetadataModal
          metadata={fileMetadata[showMetadata]}
          onClose={() => setShowMetadata(null)}
          onSave={handleMetadataSave}
        />
      )}

      {/* Preview Modal */}
      {showPreview && fileMetadata[showPreview] && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-5xl max-h-[80vh] overflow-y-auto border border-gray-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                ตัวอย่างข้อมูล: {fileMetadata[showPreview].filename}
              </h3>
              <button 
                onClick={() => setShowPreview(null)}
                className="text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    {fileMetadata[showPreview].columns?.map((col: any) => (
                      <th key={col.name} className="px-3 py-2 text-left font-medium border-r border-gray-300">
                        {col.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fileMetadata[showPreview].preview?.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="border-t border-gray-300">
                      {fileMetadata[showPreview].columns?.map((col: any) => (
                        <td key={col.name} className="px-3 py-2 border-r border-gray-300">
                          {row[col.name]?.toString() || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  )
}