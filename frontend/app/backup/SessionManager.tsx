import { useState } from 'react'
import { apiService } from '../lib/api'

interface SessionData {
  session_id: string
  project_id: string
  name: string
  created_at: string
  updated_at: string
}

interface SessionManagerProps {
  projectId: string
  sessions: SessionData[]
  currentSessionId: string | null
  onSessionSelect: (sessionId: string) => void
  onSessionsUpdate: (sessions: SessionData[]) => void
}

export default function SessionManager({ 
  projectId, 
  sessions, 
  currentSessionId, 
  onSessionSelect, 
  onSessionsUpdate 
}: SessionManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newSessionName, setNewSessionName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editSessionName, setEditSessionName] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const createSession = async () => {
    if (!newSessionName.trim()) return

    setIsCreating(true)
    try {
      const newSession = await apiService.createSession(projectId, newSessionName)
      const updatedSessions = await apiService.getSessions(projectId)
      onSessionsUpdate(updatedSessions)
      onSessionSelect(newSession.session_id)
      setNewSessionName('')
      setShowCreateForm(false)
    } catch (error) {
      console.error('Failed to create session:', error)
      alert('ไม่สามารถสร้าง session ได้')
    } finally {
      setIsCreating(false)
    }
  }

  const startEdit = (session: SessionData) => {
    setEditingSessionId(session.session_id)
    setEditSessionName(session.name)
  }

  const updateSession = async () => {
    if (!editSessionName.trim() || !editingSessionId) return

    setIsUpdating(true)
    try {
      await apiService.updateSession(editingSessionId, editSessionName)
      const updatedSessions = await apiService.getSessions(projectId)
      onSessionsUpdate(updatedSessions)
      setEditingSessionId(null)
      setEditSessionName('')
    } catch (error) {
      console.error('Failed to update session:', error)
      alert('ไม่สามารถแก้ไข session ได้')
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteSession = async (sessionId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบ session นี้?')) return

    setIsDeleting(sessionId)
    try {
      await apiService.deleteSession(sessionId)
      const updatedSessions = await apiService.getSessions(projectId)
      onSessionsUpdate(updatedSessions)
      
      // If deleted session was current, clear selection
      if (currentSessionId === sessionId) {
        onSessionSelect(updatedSessions[0]?.session_id || '')
      }
    } catch (error) {
      console.error('Failed to delete session:', error)
      alert('ไม่สามารถลบ session ได้')
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Chat Sessions</h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
        >
          + Session ใหม่
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-4 p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
          <input
            type="text"
            value={newSessionName}
            onChange={(e) => setNewSessionName(e.target.value)}
            placeholder="ชื่อ session"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md mb-3 dark:bg-gray-800 dark:text-white text-sm"
          />
          <div className="flex space-x-2">
            <button
              onClick={createSession}
              disabled={isCreating || !newSessionName.trim()}
              className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 text-sm"
            >
              {isCreating ? 'กำลังสร้าง...' : 'สร้าง'}
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 text-sm"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          <div className="text-2xl mb-2">💬</div>
          <p className="text-sm">ยังไม่มี session</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.session_id}
              className={`p-3 border rounded-lg transition-colors ${
                currentSessionId === session.session_id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {editingSessionId === session.session_id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editSessionName}
                    onChange={(e) => setEditSessionName(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={updateSession}
                      disabled={isUpdating || !editSessionName.trim()}
                      className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:opacity-50"
                    >
                      {isUpdating ? 'กำลังบันทึก...' : 'บันทึก'}
                    </button>
                    <button
                      onClick={() => setEditingSessionId(null)}
                      className="px-2 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-400"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div 
                    onClick={() => onSessionSelect(session.session_id)}
                    className="flex-1 cursor-pointer"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {session.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(session.created_at).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        startEdit(session)
                      }}
                      className="p-1 text-gray-400 hover:text-blue-500 text-xs"
                      title="แก้ไข"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteSession(session.session_id)
                      }}
                      disabled={isDeleting === session.session_id}
                      className="p-1 text-gray-400 hover:text-red-500 text-xs disabled:opacity-50"
                      title="ลบ"
                    >
                      {isDeleting === session.session_id ? '⏳' : '🗑️'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}