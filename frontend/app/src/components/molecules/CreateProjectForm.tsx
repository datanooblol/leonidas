import { useState } from 'react'
import { Input } from '../atoms/Input'
import { Textarea } from '../atoms/Textarea'
import { Button } from '../atoms/Button'
import { Card } from '../atoms/Card'

interface CreateProjectFormProps {
  onSubmit: (name: string, description: string) => Promise<boolean>
  onCancel: () => void
}

export const CreateProjectForm = ({ onSubmit, onCancel }: CreateProjectFormProps) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) return
    
    setIsLoading(true)
    const success = await onSubmit(name, description)
    
    if (success) {
      setName('')
      setDescription('')
      onCancel()
    } else {
      alert('ไม่สามารถสร้างโปรเจคได้')
    }
    setIsLoading(false)
  }

  return (
    <Card className="mb-6">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="ชื่อโปรเจค"
        className="mb-4"
      />
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="คำอธิบาย (ไม่บังคับ)"
        rows={3}
        className="mb-4"
      />
      <div className="flex space-x-3">
        <Button onClick={handleSubmit} disabled={isLoading} className="w-auto">
          สร้าง
        </Button>
        <Button variant="secondary" onClick={onCancel} className="w-auto">
          ยกเลิก
        </Button>
      </div>
    </Card>
  )
}