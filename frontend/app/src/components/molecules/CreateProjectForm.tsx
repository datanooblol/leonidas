import { useState, useEffect } from 'react'
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

  useEffect(() => {
    const preventDefault = (e: Event) => e.preventDefault()
    document.body.style.overflow = 'hidden'
    document.addEventListener('wheel', preventDefault, { passive: false })
    document.addEventListener('touchmove', preventDefault, { passive: false })
    
    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('wheel', preventDefault)
      document.removeEventListener('touchmove', preventDefault)
    }
  }, [])

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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm bg-white bg-opacity-20 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <Card className="w-full max-w-md mx-4">
        <h3 className="text-lg font-medium mb-4">สร้างโปรเจคใหม่</h3>
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
          className="mb-4 resize-none"
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
    </div>
  )
}