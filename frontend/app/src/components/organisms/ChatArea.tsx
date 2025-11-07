import { useState } from 'react'
import { ChatInput } from '../molecules/ChatInput'
import { MarkdownRenderer } from './MarkdownRenderer'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  artifacts?: any[]
}

interface ChatAreaProps {
  messages: Message[]
  input: string
  isLoading: boolean
  currentSession: string | null
  selectedFilesCount: number
  useFileData: boolean
  onInputChange: (value: string) => void
  onSendMessage: () => void
  onToggleSidebar: () => void
  onToggleFileData: () => void
  onBack: () => void
}

export const ChatArea = ({
  messages,
  input,
  isLoading,
  currentSession,
  selectedFilesCount,
  useFileData,
  onInputChange,
  onSendMessage,
  onToggleSidebar,
  onToggleFileData,
  onBack
}: ChatAreaProps) => {
  const [expandedArtifacts, setExpandedArtifacts] = useState<Set<string>>(new Set())

  const toggleArtifact = (messageId: string, artifactIndex: number) => {
    const key = `${messageId}-${artifactIndex}`
    setExpandedArtifacts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={onToggleSidebar} className="text-gray-600 hover:text-gray-800">
            ☰
          </button>
          <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
            ← Dashboard
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        {!currentSession ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-medium mb-2">เริ่มการสนทนาใหม่</h3>
              <p className="text-gray-500">เลือกไฟล์และเริ่มถามคำถามเกี่ยวกับข้อมูล</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'user' ? (
                  <div className="max-w-xs lg:max-w-2xl px-4 py-2 rounded-lg bg-gray-200 text-gray-800">
                    {message.content}
                  </div>
                ) : (
                  <div className="max-w-xs lg:max-w-2xl">
                    <MarkdownRenderer content={message.content} />
                    
                    {/* SQL Artifacts */}
                    {message.artifacts && message.artifacts.some(artifact => 
                      artifact.type === 'sql' || artifact.language === 'sql'
                    ) && (
                      <div className="mt-2">
                        {message.artifacts
                          .filter(artifact => artifact.type === 'sql' || artifact.language === 'sql')
                          .map((artifact, index) => {
                            const key = `${message.id}-${index}`
                            const isExpanded = expandedArtifacts.has(key)
                            
                            return (
                              <div key={index} className="inline-block">
                                <button
                                  onClick={() => toggleArtifact(message.id, index)}
                                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                                >
                                  SQL {isExpanded ? '▼' : '▶'}
                                </button>
                                
                                {isExpanded && (
                                  <div className="mt-2 bg-gray-50 border border-gray-200 rounded p-2">
                                    <pre className="text-xs text-gray-700 overflow-x-auto">
                                      <code>{artifact.content || artifact.code}</code>
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )
                          })
                        }
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span>AI กำลังตอบ...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Input Area */}
      {currentSession && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-gray-300 rounded-2xl shadow-lg p-4">
              <ChatInput
                value={input}
                onChange={onInputChange}
                onSend={onSendMessage}
                placeholder="พิมพ์คำถามเกี่ยวกับข้อมูล..."
                disabled={isLoading}
                useFileData={useFileData}
                onToggleFileData={onToggleFileData}
                selectedFilesCount={selectedFilesCount}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}