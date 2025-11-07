import { useState } from 'react'
import { Modal } from '../atoms/Modal'
import { Button } from '../atoms/Button'

interface NewChatModalProps {
  show: boolean
  onClose: () => void
  onCreateChat: (name: string) => void
  isCreating: boolean
}

export const NewChatModal = ({ show, onClose, onCreateChat, isCreating }: NewChatModalProps) => {
  const [chatName, setChatName] = useState('')

  if (!show) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (chatName.trim()) {
      onCreateChat(chatName.trim())
      setChatName('')
    }
  }

  const handleClose = () => {
    setChatName('')
    onClose()
  }

  return (
    <Modal onClose={handleClose}>
      <div className="w-96">
        <h2 className="text-lg font-semibold mb-4">สร้างแชทใหม่</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">ชื่อแชท</label>
            <input
              type="text"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              placeholder="ใส่ชื่อแชท..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              disabled={isCreating}
            />
          </div>
          
          <div className="flex space-x-2 justify-end">
            <Button 
              variant="secondary" 
              onClick={handleClose}
              disabled={isCreating}
            >
              ยกเลิก
            </Button>
            <Button 
              type="submit"
              disabled={!chatName.trim() || isCreating}
            >
              {isCreating ? 'กำลังสร้าง...' : 'สร้างแชท'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}