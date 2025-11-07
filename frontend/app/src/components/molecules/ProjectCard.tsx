import { useState, useRef, useEffect } from 'react'
import { Card } from '../atoms/Card'

interface Project {
  project_id: string
  name: string
  description: string
  created_at: string
}

interface ProjectCardProps {
  project: Project
  onSelect: (projectId: string, project: Project) => void
  onUpdateProject?: (projectId: string, name: string, description: string) => void
  onDeleteProject?: (projectId: string) => void
}

export const ProjectCard = ({ project, onSelect, onUpdateProject, onDeleteProject }: ProjectCardProps) => {
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(project.name)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Freeze all scrolling when menu is open
  useEffect(() => {
    if (showMenu) {
      const preventDefault = (e: Event) => e.preventDefault()
      document.body.style.overflow = 'hidden'
      document.addEventListener('wheel', preventDefault, { passive: false })
      document.addEventListener('touchmove', preventDefault, { passive: false })
      return () => {
        document.body.style.overflow = 'unset'
        document.removeEventListener('wheel', preventDefault)
        document.removeEventListener('touchmove', preventDefault)
      }
    }
  }, [showMenu])

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMenu(!showMenu)
  }

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
    setEditName(project.name)
    setShowMenu(false)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`ต้องการลบโปรเจค "${project.name}" หรือไม่?`)) {
      onDeleteProject?.(project.project_id)
    }
    setShowMenu(false)
  }

  const handleSaveEdit = () => {
    if (editName.trim() && editName !== project.name && onUpdateProject) {
      onUpdateProject(project.project_id, editName.trim(), project.description)
    }
    setIsEditing(false)
  }

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <Card onClick={() => !isEditing && onSelect(project.project_id, project)}>
      <div className="flex justify-between items-start mb-2">
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit()
              if (e.key === 'Escape') { setEditName(project.name); setIsEditing(false) }
            }}
            onClick={handleInputClick}
            className="text-lg font-medium text-gray-900 w-full border border-blue-500 rounded px-2 py-1 focus:outline-none"
            autoFocus
          />
        ) : (
          <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
        )}
        
        <div className="relative" ref={menuRef}>
          <button
            onClick={handleMenuClick}
            className="text-gray-400 hover:text-gray-600 p-1 text-lg"
          >
            ⋮
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-1 w-32 bg-white border rounded-md shadow-lg z-10">
              <button
                onClick={handleRename}
                className="w-full text-center px-3 py-2 text-sm hover:bg-gray-100"
              >
                เปลี่ยนชื่อ
              </button>
              <button
                onClick={handleDelete}
                className="w-full text-center px-3 py-2 text-sm hover:bg-red-50 hover:text-red-600"
              >
                ลบ
              </button>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-4">
        {project.description || 'ไม่มีคำอธิบาย'}
      </p>
      <div className="flex justify-between text-sm text-gray-600">
        <span>สร้างเมื่อ</span>
        <span>{new Date(project.created_at).toLocaleDateString('th-TH')}</span>
      </div>
    </Card>
  )
}