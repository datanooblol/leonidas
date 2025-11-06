import { useState } from 'react'
import { Button } from '../atoms/Button'
import { Input } from '../atoms/Input'

interface CreateSessionFormProps {
  onSubmit: (name: string) => void
  onCancel: () => void
  isCreating: boolean
}

export const CreateSessionForm = ({ onSubmit, onCancel, isCreating }: CreateSessionFormProps) => {
  const [sessionName, setSessionName] = useState('')

  const handleSubmit = () => {
    if (sessionName.trim()) {
      onSubmit(sessionName.trim())
      setSessionName('')
    }
  }

  return (
    <div className="mb-4 p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
      <Input
        type="text"
        value={sessionName}
        onChange={(e) => setSessionName(e.target.value)}
        placeholder="ชื่อ session"
        className="w-full mb-3 text-sm"
      />
      <div className="flex space-x-2">
        <Button
          onClick={handleSubmit}
          disabled={isCreating || !sessionName.trim()}
          className="px-3 py-1 text-sm w-auto bg-green-500 hover:bg-green-600"
        >
          {isCreating ? 'กำลังสร้าง...' : 'สร้าง'}
        </Button>
        <Button
          onClick={onCancel}
          variant="secondary"
          className="px-3 py-1 text-sm w-auto"
        >
          ยกเลิก
        </Button>
      </div>
    </div>
  )
}