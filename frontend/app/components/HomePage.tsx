import { useState, useEffect } from 'react'
import { apiService } from '../lib/api'

interface Project {
  project_id: string
  name: string
  description: string
  created_at: string
  updated_at: string
}

interface HomePageProps {
  userEmail: string
  onSelectProject: (projectId: string, project: Project) => void
  onLogout: () => void
}

export default function HomePage({ userEmail, onSelectProject, onLogout }: HomePageProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const projectsData = await apiService.getProjects()
      setProjects(projectsData)
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createProject = async () => {
    if (!newProjectName.trim()) return
    
    try {
      const newProject = await apiService.createProject(newProjectName, newProjectDesc)
      setProjects(prev => [newProject, ...prev])
      setNewProjectName('')
      setNewProjectDesc('')
      setShowCreateForm(false)
    } catch (error) {
      console.error('Failed to create project:', error)
      alert('ไม่สามารถสร้างโปรเจคได้')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">กำลังโหลดโปรเจค...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Chat Assistant</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">สวัสดี {userEmail}</p>
          </div>
          <button onClick={onLogout} className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">โปรเจคของคุณ</h2>
          <button onClick={() => setShowCreateForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            + สร้างโปรเจคใหม่
          </button>
        </div>

        {showCreateForm && (
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="ชื่อโปรเจค"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md mb-4 dark:bg-gray-700 dark:text-white"
            />
            <textarea
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              placeholder="คำอธิบาย (ไม่บังคับ)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md mb-4 dark:bg-gray-700 dark:text-white"
              rows={3}
            />
            <div className="flex space-x-3">
              <button onClick={createProject} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">สร้าง</button>
              <button onClick={() => setShowCreateForm(false)} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400">ยกเลิก</button>
            </div>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📁</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">ยังไม่มีโปรเจค</h3>
            <p className="text-gray-600 dark:text-gray-400">เริ่มต้นด้วยการสร้างโปรเจคแรกของคุณ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.project_id}
                onClick={() => onSelectProject(project.project_id, project)}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md cursor-pointer transition-shadow"
              >
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{project.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{project.description || 'ไม่มีคำอธิบาย'}</p>
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>สร้างเมื่อ</span>
                  <span>{new Date(project.created_at).toLocaleDateString('th-TH')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}