'use client'

import { useState } from 'react'
import LoginForm from './components/LoginForm'
import RegisterForm from './backup/RegisterForm'
import HomePage from './components/HomePage'
import ProjectDashboard from './components/ProjectDashboard'
import TestPage from './components/TestPage'
import { apiService } from './lib/api'
import MarkdownRenderer from './backup/MarkdownRenderer'

type AppState = 'login' | 'register' | 'home' | 'project' | 'test'

interface ProjectData {
  project_id: string
  name: string
  description: string
  created_at: string
  updated_at: string
}

export default function App() {
  const [appState, setAppState] = useState<AppState>('login')
  const [userEmail, setUserEmail] = useState('')
  const [currentProject, setCurrentProject] = useState<ProjectData | null>(null)

  const handleLogin = (email: string) => {
    setUserEmail(email)
    setAppState('home')
  }

  const handleRegister = (email: string) => {
    setUserEmail(email)
    setAppState('home')
  }

  const handleLogout = () => {
    apiService.clearAuthToken()
    setUserEmail('')
    setCurrentProject(null)
    setAppState('login')
  }

  const handleSelectProject = (projectId: string, project: ProjectData) => {
    setCurrentProject(project)
    setAppState('project')
  }

  const handleBackToHome = () => {
    setCurrentProject(null)
    setAppState('home')
  }

  const handleSwitchToRegister = () => {
    setAppState('register')
  }

  const handleSwitchToLogin = () => {
    setAppState('login')
  }

  if (appState === 'test') {
    const markdownContent = "# AI Response\n\nThis is **markdown** content with:\n\n- Lists\n- **Bold text**\n- `Code blocks`\n\n```javascript\nconsole.log('Hello World');\n```";
    return (
      <div className="p-8">
        <TestPage />
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Markdown Example:</h2>
          <MarkdownRenderer content={markdownContent} />
        </div>
      </div>
    )
  }

  if (appState === 'login') {
    return <LoginForm onLogin={handleLogin} onSwitchToRegister={handleSwitchToRegister} />
  }

  if (appState === 'register') {
    return <RegisterForm onRegister={handleRegister} onSwitchToLogin={handleSwitchToLogin} />
  }

  if (appState === 'home') {
    return (
      <HomePage
        userEmail={userEmail}
        onSelectProject={handleSelectProject}
        onLogout={handleLogout}
      />
    )
  }

  if (appState === 'project' && currentProject) {
    return (
      <ProjectDashboard
        project={currentProject}
        onBack={handleBackToHome}
      />
    )
  }

  return null
}