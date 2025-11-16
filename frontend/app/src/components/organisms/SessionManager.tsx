import { useState } from 'react'
import { Card } from '../atoms/Card'
import { Heading } from '../atoms/Heading'
import { Button } from '../atoms/Button'
import { CreateSessionForm } from '../molecules/CreateSessionForm'
import { SessionItem } from '../molecules/SessionItem'
import { apiService } from '../../../api/api'

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

export const SessionManager = ({ 
  projectId, 
  sessions, 
  currentSessionId, 
  onSessionSelect, 
  onSessionsUpdate 
}: SessionManagerProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const createSession = async (name: string) => {
    setIsCreating(true)
    try {
      const newSession = await apiService.createSession(projectId, name)
      const updatedSessions = await apiService.getSessions(projectId)
      onSessionsUpdate(updatedSessions)
      onSessionSelect(newSession.session_id)
      setShowCreateForm(false)
    } catch (error) {
      console.error('Failed to create session:', error)
      alert('ไม่สามารถสร้าง session ได้')
    } finally {
      setIsCreating(false)
    }
  }

  const updateSession = async (name: string) => {
    if (!editingSessionId) return

    setIsUpdating(true)
    try {
      await apiService.updateSession(editingSessionId, name)
      const updatedSessions = await apiService.getSessions(projectId)
      onSessionsUpdate(updatedSessions)
      setEditingSessionId(null)
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
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Heading>Chat Sessions</Heading>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="px-3 py-2 text-sm w-auto"
          variant="primary"
        >
          + Session ใหม่
        </Button>
      </div>

      {showCreateForm && (
        <CreateSessionForm
          onSubmit={createSession}
          onCancel={() => setShowCreateForm(false)}
          isCreating={isCreating}
        />
      )}

      {sessions.length === 0 ? (
        <div className="text-center py-6 text-gray-600">
          <div className="text-2xl mb-2">💬</div>
          <p className="text-sm">ยังไม่มี session</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => (
            <SessionItem
              key={session.session_id}
              session={session}
              isSelected={currentSessionId === session.session_id}
              isEditing={editingSessionId === session.session_id}
              isUpdating={isUpdating}
              isDeleting={isDeleting === session.session_id}
              onSelect={() => onSessionSelect(session.session_id)}
              onEdit={() => setEditingSessionId(session.session_id)}
              onUpdate={updateSession}
              onCancelEdit={() => setEditingSessionId(null)}
              onDelete={() => deleteSession(session.session_id)}
            />
          ))}
        </div>
      )}
    </Card>
  )
}