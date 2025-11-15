import { useState, useEffect } from 'react'
import { Button } from '../atoms/Button'
import { Input } from '../atoms/Input'

interface EditSessionFormProps {
  initialName: string
  onSubmit: (name: string) => void
  onCancel: () => void
  isUpdating: boolean
}

export const EditSessionForm = ({ initialName, onSubmit, onCancel, isUpdating }: EditSessionFormProps) => {
  const [sessionName, setSessionName] = useState(initialName)

  useEffect(() => {
    setSessionName(initialName)
  }, [initialName])

  const handleSubmit = () => {
    if (sessionName.trim()) {
      onSubmit(sessionName.trim())
    }
  }

  return (
    <div className="space-y-2">
      <Input
        type="text"
        value={sessionName}
        onChange={(e) => setSessionName(e.target.value)}
        className="w-full text-sm"
      />
      <div className="flex space-x-2">
        <Button
          onClick={handleSubmit}
          disabled={isUpdating || !sessionName.trim()}
          className="px-2 py-1 text-xs w-auto bg-green-500 hover:bg-green-600"
        >
          {isUpdating ? 'กำลังบันทึก...' : 'บันทึก'}
        </Button>
        <Button
          onClick={onCancel}
          variant="secondary"
          className="px-2 py-1 text-xs w-auto"
        >
          ยกเลิก
        </Button>
      </div>
    </div>
  )
}