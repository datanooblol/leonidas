'use client'

import { useState } from 'react'
import { apiService } from '../lib/api'
import MarkdownRenderer from '../backup/MarkdownRenderer'

export default function TestPage() {
  const [email, setEmail] = useState('user@example.com')
  const [password, setPassword] = useState('string')
  const [projectId, setProjectId] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<{user: string, ai: string}[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showMarkdown, setShowMarkdown] = useState<{[key: number]: boolean}>({})
  const [fileData, setFileData] = useState<any[]>([])
  const [allProjects, setAllProjects] = useState<any[]>([])
  const [allSessions, setAllSessions] = useState<any[]>([])
  const [selectedFileId, setSelectedFileId] = useState('')
  const [fileMetadata, setFileMetadata] = useState<any>(null)

  const handleLogin = async () => {
    setIsLoading(true)
    setError('')
    try {
      await apiService.login(email, password)
      setIsLoggedIn(true)
    } catch (error) {
      setError('Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const loadChatHistory = async () => {
    if (!sessionId) return
    
    setIsLoading(true)
    setError('')
    try {
      const history = await apiService.getChatHistory(sessionId)
      console.log('📋 Chat History:', history)
      const formattedHistory = history.messages.map(msg => ({
        user: msg.role === 'user' ? msg.content : '',
        ai: msg.role === 'assistant' ? msg.content : ''
      })).filter(msg => msg.user || msg.ai)
      
      // Group user and AI messages together
      const groupedHistory: {user: string, ai: string}[] = []
      for (let i = 0; i < formattedHistory.length; i += 2) {
        const userMsg = formattedHistory[i]
        const aiMsg = formattedHistory[i + 1]
        if (userMsg && aiMsg) {
          groupedHistory.push({
            user: userMsg.user || userMsg.ai,
            ai: aiMsg.ai || aiMsg.user
          })
        }
      }
      
      setChatHistory(groupedHistory)
    } catch (error) {
      setError('Load history failed: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!sessionId || !message) return
    
    const userMessage = message
    setMessage('')
    setIsLoading(true)
    setError('')
    
    try {
      const result = await apiService.sendMessage(sessionId, userMessage)
      console.log('🤖 AI Response:', result)
      setChatHistory(prev => [...prev, {
        user: userMessage,
        ai: result.content
      }])
    } catch (error) {
      setError('Send message failed: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const loadFileData = async () => {
    if (!projectId) return
    
    setIsLoading(true)
    setError('')
    try {
      const files = await apiService.getFiles(projectId)
      console.log('📁 File Data:', files)
      setFileData(files)
    } catch (error) {
      setError('Load files failed: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAllProjects = async () => {
    setIsLoading(true)
    setError('')
    try {
      const projects = await apiService.getProjects()
      console.log('📂 All Projects:', projects)
      setAllProjects(projects)
    } catch (error) {
      setError('Load projects failed: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAllSessions = async () => {
    if (!projectId) return
    
    setIsLoading(true)
    setError('')
    try {
      const sessions = await apiService.getSessions(projectId)
      console.log('💬 All Sessions:', sessions)
      setAllSessions(sessions)
    } catch (error) {
      setError('Load sessions failed: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const loadFileMetadata = async () => {
    if (!selectedFileId) return
    
    setIsLoading(true)
    setError('')
    try {
      const metadata = await apiService.getFileMetadata(selectedFileId)
      console.log('📊 File Metadata:', metadata)
      setFileMetadata(metadata)
    } catch (error) {
      setError('Load metadata failed: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-black">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-white">API Test Page</h1>
        
        {!isLoggedIn ? (
          <div className="bg-gray-800 p-6 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-4 text-white">Login</h2>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded bg-gray-700 text-white border-gray-600"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded bg-gray-700 text-white border-gray-600"
              />
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 p-6 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-4 text-white">Chat Test</h2>
            <div className="space-y-4">
              <div className="bg-gray-900 p-3 rounded mb-4">
                <h4 className="text-sm font-medium mb-2 text-white">Current IDs:</h4>
                <div className="text-xs text-gray-300 space-y-1">
                  <div>📂 Project ID: {projectId || 'None'}</div>
                  <div>💬 Session ID: {sessionId || 'None'}</div>
                  <div>📁 File ID: {selectedFileId || 'None'}</div>
                </div>
              </div>
              <input
                type="text"
                placeholder="Project ID"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 border rounded bg-gray-700 text-white border-gray-600"
              />
              <input
                type="text"
                placeholder="Session ID"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className="w-full px-3 py-2 border rounded bg-gray-700 text-white border-gray-600"
              />
              <input
                type="text"
                placeholder="File ID (for metadata)"
                value={selectedFileId}
                onChange={(e) => setSelectedFileId(e.target.value)}
                className="w-full px-3 py-2 border rounded bg-gray-700 text-white border-gray-600"
              />
              <textarea
                placeholder="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border rounded h-24 bg-gray-700 text-white border-gray-600"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !sessionId || !message}
                  className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Send Message'}
                </button>
                <button
                  onClick={loadChatHistory}
                  disabled={!sessionId}
                  className="px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50"
                >
                  Load History
                </button>
                <button
                  onClick={loadFileData}
                  disabled={!projectId}
                  className="px-4 py-2 bg-yellow-500 text-white rounded disabled:opacity-50"
                >
                  Load Files
                </button>
                <button
                  onClick={loadAllProjects}
                  className="px-4 py-2 bg-indigo-500 text-white rounded disabled:opacity-50"
                >
                  Load Projects
                </button>
                <button
                  onClick={loadAllSessions}
                  disabled={!projectId}
                  className="px-4 py-2 bg-pink-500 text-white rounded disabled:opacity-50"
                >
                  Load Sessions
                </button>
                <button
                  onClick={loadFileMetadata}
                  disabled={!selectedFileId}
                  className="px-4 py-2 bg-orange-500 text-white rounded disabled:opacity-50"
                >
                  Get Metadata
                </button>
                <button
                  onClick={() => setIsLoggedIn(false)}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900 border border-red-600 text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {allProjects.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-4 text-white">All Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {allProjects.map((project) => (
                <div key={project.project_id} className="bg-gray-900 p-3 rounded border border-gray-600">
                  <div className="text-white text-sm font-medium">{project.name}</div>
                  <div className="text-yellow-400 text-xs font-mono">{project.project_id}</div>
                  <div className="text-gray-400 text-xs">{project.description}</div>
                  <button
                    onClick={() => setProjectId(project.project_id)}
                    className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
                  >
                    Use This Project
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {allSessions.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-4 text-white">All Sessions (Project: {projectId})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {allSessions.map((session) => (
                <div key={session.session_id} className="bg-gray-900 p-3 rounded border border-gray-600">
                  <div className="text-white text-sm font-medium">{session.name}</div>
                  <div className="text-cyan-400 text-xs font-mono">{session.session_id}</div>
                  <div className="text-gray-400 text-xs">{new Date(session.created_at).toLocaleString()}</div>
                  <button
                    onClick={() => setSessionId(session.session_id)}
                    className="mt-2 px-2 py-1 bg-green-500 text-white rounded text-xs"
                  >
                    Use This Session
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {fileMetadata && (
          <div className="bg-gray-800 p-6 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-4 text-white">File Metadata</h2>
            <div className="bg-gray-900 p-4 rounded overflow-x-auto">
              <pre className="text-blue-400 text-sm whitespace-pre-wrap">
                {JSON.stringify(fileMetadata, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {fileData.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-4 text-white">File Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {fileData.map((file) => (
                <div key={file.file_id} className="bg-gray-900 p-3 rounded border border-gray-600">
                  <div className="text-white text-sm font-medium">{file.filename}</div>
                  <div className="text-yellow-400 text-xs font-mono">{file.file_id}</div>
                  <div className="text-gray-400 text-xs">{file.file_type} - {file.size ? (file.size / 1024).toFixed(1) + ' KB' : 'Unknown size'}</div>
                  <button
                    onClick={() => setSelectedFileId(file.file_id)}
                    className="mt-2 px-2 py-1 bg-orange-500 text-white rounded text-xs"
                  >
                    Select for Metadata
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {chatHistory.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-white">Chat History</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {chatHistory.map((chat, index) => (
                <div key={index} className="space-y-2">
                  <div className="bg-blue-600 p-3 rounded">
                    <strong className="text-white">You:</strong> <span className="text-white">{chat.user}</span>
                  </div>
                  <div className="bg-gray-600 p-3 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <strong className="text-white">AI:</strong>
                      <button
                        onClick={() => setShowMarkdown(prev => ({...prev, [index]: !prev[index]}))}
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                      >
                        {showMarkdown[index] ? 'Show Plain' : 'Show Markdown'}
                      </button>
                    </div>
                    {showMarkdown[index] ? (
                      <div className="text-white">
                        <MarkdownRenderer content={chat.ai} />
                      </div>
                    ) : (
                      <div className="text-white whitespace-pre-wrap">{chat.ai}</div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="bg-gray-600 p-3 rounded">
                  <strong className="text-white">AI:</strong> <span className="text-white">กำลังตอบ...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}