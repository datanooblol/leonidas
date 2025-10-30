'use client'

import { useState, useRef, useEffect } from 'react'
import { apiService } from '../lib/api'
import MetadataModal from './MetadataModal'
import MarkdownRenderer from './MarkdownRenderer'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

interface FileData {
  file_id: string
  project_id: string
  filename: string
  size: number
  file_type: string
  created_at: string
}

interface ColumnMetadata {
  name: string
  dtype: string
  nullable: boolean
  unique_values?: number
  sample_values?: any[]
  description?: string
  input_type?: string
}

interface FileMetadata {
  file_id: string
  filename: string
  file_type: string
  rows?: number
  columns?: ColumnMetadata[]
  preview?: Record<string, any>[]
}

interface NotebookChatProps {
  projectId: string
  sessionId: string
  onBack: () => void
}

export default function NotebookChat({ projectId, sessionId, onBack }: NotebookChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [files, setFiles] = useState<FileData[]>([])
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [fileMetadata, setFileMetadata] = useState<Record<string, FileMetadata>>({})
  const [showMetadata, setShowMetadata] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadData()
  }, [sessionId, projectId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
        timestamp: new Date(msg.created_at)
      }))
      
      setMessages(formattedMessages)
      setFiles(filesData)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const loadFileMetadata = async (fileId: string) => {
    const file = files.find(f => f.file_id === fileId)
    if (!file) return

    // Mock data - replace with real API call
    const mockMetadata: FileMetadata = {
      file_id: fileId,
      filename: file.filename,
      file_type: file.file_type,
      rows: Math.floor(Math.random() * 10000) + 100,
      columns: [
        { 
          name: "id", 
          dtype: "int64", 
          nullable: false, 
          unique_values: 1000, 
          sample_values: [1, 2, 3],
          description: "รหัสประจำตัวผู้ใช้",
          input_type: "ID"
        },
        { 
          name: "name", 
          dtype: "object", 
          nullable: true, 
          unique_values: 800, 
          sample_values: ["John", "Jane", "Bob"],
          description: "ชื่อผู้ใช้",
          input_type: "input"
        },
        { 
          name: "age", 
          dtype: "int64", 
          nullable: true, 
          unique_values: 50, 
          sample_values: [25, 30, 35],
          description: "อายุ (ปี)",
          input_type: "input"
        },
        { 
          name: "salary", 
          dtype: "float64", 
          nullable: true, 
          unique_values: 900, 
          sample_values: [50000.0, 60000.0, 75000.0],
          description: "เงินเดือน (บาท)",
          input_type: "input"
        },
        { 
          name: "temp_field", 
          dtype: "object", 
          nullable: true, 
          unique_values: 2, 
          sample_values: ["temp1", "temp2"],
          description: "ฟิลด์ชั่วคราว",
          input_type: "reject"
        }
      ],
      preview: [
        { id: 1, name: "John", age: 25, salary: 50000.0, temp_field: "temp1" },
        { id: 2, name: "Jane", age: 30, salary: 60000.0, temp_field: "temp2" },
        { id: 3, name: "Bob", age: 35, salary: 75000.0, temp_field: "temp1" },
        { id: 4, name: "Alice", age: 28, salary: 55000.0, temp_field: "temp2" },
        { id: 5, name: "Charlie", age: 32, salary: 70000.0, temp_field: "temp1" }
      ]
    }
    
    setFileMetadata(prev => ({ ...prev, [fileId]: mockMetadata }))
  }

  const handleMetadataSave = (updatedMetadata: FileMetadata) => {
    setFileMetadata(prev => ({ ...prev, [updatedMetadata.file_id]: updatedMetadata }))
    // TODO: Send to API
    console.log('Updated metadata:', updatedMetadata)
  }

  const toggleFileSelection = (fileId: string) => {
    const newSelected = new Set(selectedFiles)
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId)
    } else {
      newSelected.add(fileId)
    }
    setSelectedFiles(newSelected)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files
    if (!uploadedFiles) return

    try {
      for (const file of Array.from(uploadedFiles)) {
        await apiService.uploadFile(projectId, file)
      }
      const updatedFiles = await apiService.getFiles(projectId)
      setFiles(updatedFiles)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (error) {
      console.error('Upload failed:', error)
    }
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
      const response = await apiService.sendMessage(sessionId, messageContent)
      
      const assistantMessage: Message = {
        id: response.id,
        content: response.content,
        role: 'assistant',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">เอกสารแหล่งข้อมูล</h2>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept=".txt,.pdf,.doc,.docx,.json,.csv,.md,.py,.js,.ts"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg"
              title="อัปโหลดไฟล์"
            >
              📁
            </button>
          </div>
          
          {selectedFiles.size > 0 && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                เลือกแล้ว {selectedFiles.size} ไฟล์
              </p>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {files.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-3xl mb-2">📄</div>
              <p className="text-sm">ยังไม่มีเอกสาร</p>
              <p className="text-xs mt-1">คลิก 📁 เพื่ออัปโหลด</p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.file_id}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedFiles.has(file.file_id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div 
                    onClick={() => toggleFileSelection(file.file_id)}
                    className="flex items-start justify-between cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.filename}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {file.size ? formatFileSize(file.size) : 'Unknown size'}
                      </p>
                    </div>
                    <div className="ml-2">
                      {selectedFiles.has(file.file_id) ? (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      ) : (
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        loadFileMetadata(file.file_id)
                        setShowMetadata(file.file_id)
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 dark:bg-blue-900 rounded"
                    >
                      📊 ดูข้อมูล
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        loadFileMetadata(file.file_id)
                        setShowPreview(file.file_id)
                      }}
                      className="text-xs text-purple-600 hover:text-purple-800 px-2 py-1 bg-purple-50 dark:bg-purple-900 rounded"
                    >
                      👁️ ดูตัวอย่าง
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
            <button
              onClick={onBack}
              className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              ← กลับ
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                DS Bro - AI Data Scientist
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedFiles.size > 0 ? `ใช้ข้อมูลจาก ${selectedFiles.size} ไฟล์` : 'พร้อมช่วยวิเคราะห์ข้อมูล'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-4">🤖</div>
                <h2 className="text-xl font-medium mb-2">สวัสดี bro!</h2>
                <p>เลือกเอกสารจากด้านซ้าย แล้วเริ่มถามคำถามได้เลย</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl px-4 py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <MarkdownRenderer content={message.content} />
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString('th-TH', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex space-x-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="ถามคำถามเกี่ยวกับเอกสารของคุณ..."
              className="flex-1 resize-none border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ส่ง
            </button>
          </div>
        </div>
      </div>

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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-5xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                ตัวอย่างข้อมูล: {fileMetadata[showPreview].filename}
              </h3>
              <button 
                onClick={() => setShowPreview(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-200 dark:border-gray-600">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    {fileMetadata[showPreview].columns?.map((col) => (
                      <th key={col.name} className="px-3 py-2 text-left font-medium border-r border-gray-200 dark:border-gray-600">
                        {col.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fileMetadata[showPreview].preview?.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="border-t border-gray-200 dark:border-gray-600">
                      {fileMetadata[showPreview].columns?.map((col) => (
                        <td key={col.name} className="px-3 py-2 border-r border-gray-200 dark:border-gray-600">
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
    </div>
  )
}