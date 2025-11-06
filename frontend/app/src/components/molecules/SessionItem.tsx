import { EditSessionForm } from './EditSessionForm'

interface SessionData {
  session_id: string
  name: string
  created_at: string
}

interface SessionItemProps {
  session: SessionData
  isSelected: boolean
  isEditing: boolean
  isUpdating: boolean
  isDeleting: boolean
  onSelect: () => void
  onEdit: () => void
  onUpdate: (name: string) => void
  onCancelEdit: () => void
  onDelete: () => void
}

export const SessionItem = ({
  session,
  isSelected,
  isEditing,
  isUpdating,
  isDeleting,
  onSelect,
  onEdit,
  onUpdate,
  onCancelEdit,
  onDelete
}: SessionItemProps) => (
  <div
    className={`p-3 border rounded-lg transition-colors ${
      isSelected
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-200 hover:bg-gray-50'
    }`}
  >
    {isEditing ? (
      <EditSessionForm
        initialName={session.name}
        onSubmit={onUpdate}
        onCancel={onCancelEdit}
        isUpdating={isUpdating}
      />
    ) : (
      <div className="flex justify-between items-start">
        <div onClick={onSelect} className="flex-1 cursor-pointer">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-900">
            {session.name}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(session.created_at).toLocaleDateString('th-TH')}
          </p>
        </div>
        <div className="flex space-x-1 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="p-1 text-gray-400 hover:text-blue-500 text-xs"
            title="แก้ไข"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            disabled={isDeleting}
            className="p-1 text-gray-400 hover:text-red-500 text-xs disabled:opacity-50"
            title="ลบ"
          >
            {isDeleting ? '⏳' : '🗑️'}
          </button>
        </div>
      </div>
    )}
  </div>
)