import { useState, useEffect, useRef } from 'react'
import { ChatInput } from '../molecules/ChatInput'
import { MarkdownRenderer } from './MarkdownRenderer'
import React from 'react'

declare global {
  interface Window {
    d3: any;
  }
}

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

const D3Renderer = ({ d3Code }: { d3Code: string }) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !d3Code) return

    // Load D3 if not available
    if (!window.d3) {
      const script = document.createElement('script')
      script.src = 'https://d3js.org/d3.v7.min.js'
      script.onload = () => executeD3Code()
      document.head.appendChild(script)
    } else {
      executeD3Code()
    }

    function executeD3Code() {
      try {
        const svg = window.d3.select(svgRef.current)
        svg.selectAll('*').remove()

        // Decode HTML entities
        const decodedCode = d3Code
          .replace(/&gt;/g, '>')
          .replace(/&lt;/g, '<')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&amp;/g, '&')

        // Execute D3 code
        const func = new Function('d3', 'svg', 'width', 'height', decodedCode)
        func(window.d3, svg, 400, 300)
      } catch (error) {
        console.error('D3 execution error:', error)
        
      }
    }
  }, [d3Code])

  return (
    <div className="w-full p-4">
      <svg ref={svgRef} width="400" height="300" className="border border-gray-200 rounded"></svg>
    </div>
  )
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

  // Mock messages for testing
  const mockMessages = [
    {
      id: '1',
      content: 'นี่คือกราฟแสดงยอดขายผลไม้',
      role: 'assistant' as const,
      timestamp: new Date(),
      artifacts: [
        {
          type: 'd3',
          content: `const data = [10, 15, 7, 12, 9];
const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
const labels = ['แอปเปิ้ล', 'ส้ม', 'กล้วย', 'องุ่น', 'สตรอเบอรี่'];

svg.selectAll('rect')
  .data(data)
  .enter()
  .append('rect')
  .attr('x', (d, i) => i * 70 + 30)
  .attr('y', d => height - 50 - d * 8)
  .attr('width', 50)
  .attr('height', d => d * 8)
  .attr('fill', (d, i) => colors[i])
  .attr('rx', 4);

svg.selectAll('text')
  .data(labels)
  .enter()
  .append('text')
  .attr('x', (d, i) => i * 70 + 55)
  .attr('y', height - 20)
  .attr('text-anchor', 'middle')
  .attr('font-size', '12px')
  .text(d => d);`
        }
      ]
    }
  ]

  // Use mock messages if no real messages
  const displayMessages = messages.length > 0 ? messages : mockMessages

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
          <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
            🏠 Dashboard
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        {/* Test Chart Button - Always Show */}
        <div className="mb-4">
          <button
            onClick={() => toggleArtifact('test', 0)}
            className="px-3 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
          >
            📊 Test Chart {expandedArtifacts.has('test-0') ? '▼' : '▶'}
          </button>
          
          {expandedArtifacts.has('test-0') && (
            <div className="mt-2 bg-white border border-gray-200 rounded p-4">
              <D3Renderer d3Code={mockMessages[0].artifacts[0].content} />
            </div>
          )}
        </div>
        
        {!currentSession ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-medium mb-2">เริ่มการสนทนาใหม่</h3>
              <p className="text-gray-500">Data is power, questions are keys</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {displayMessages.map(message => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'user' ? (
                  <div className="max-w-xs lg:max-w-2xl px-4 py-2 rounded-lg bg-gray-200 text-gray-800">
                    {message.content}
                  </div>
                ) : (
                  <div className="w-full">
                    <MarkdownRenderer content={message.content} />
                    
                    {/* Test Chart Button for Every Message */}
                    <div className="mt-2">
                      <button
                        onClick={() => toggleArtifact(message.id, 999)}
                        className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors mb-2"
                      >
                        📊 Test Chart {expandedArtifacts.has(`${message.id}-999`) ? '▼' : '▶'}
                      </button>
                      
                      {expandedArtifacts.has(`${message.id}-999`) && (
                        <div className="mt-2 bg-white border border-gray-200 rounded p-4">
                          <D3Renderer d3Code={mockMessages[0].artifacts[0].content} />
                        </div>
                      )}
                    </div>

                    {/* Artifacts */}
                    {message.artifacts && message.artifacts.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.artifacts.map((artifact, index) => {
                          const key = `${message.id}-${index}`
                          const isExpanded = expandedArtifacts.has(key)
                          
                          // D3 Chart Artifacts
                          if (artifact.type === 'd3') {
                            return (
                              <div key={index} className="w-full">
                                <button
                                  onClick={() => toggleArtifact(message.id, index)}
                                  className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors mb-2"
                                >
                                  📊 Interactive Chart {isExpanded ? '▼' : '▶'}
                                </button>
                                
                                {isExpanded && (
                                  <div className="mt-2 bg-white border border-gray-200 rounded p-4">
                                    <D3Renderer d3Code={artifact.content} />
                                  </div>
                                )}
                              </div>
                            )
                          }
                          
                          // SQL Artifacts
                          if (artifact.type === 'sql' || artifact.language === 'sql') {
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
                          }
                          
                          return null
                        })}
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
          <div className="max-w-3xl mx-auto">
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