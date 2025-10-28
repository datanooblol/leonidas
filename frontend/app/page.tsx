'use client'

import { useState } from 'react'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import HomePage from './components/HomePage'
import ProjectDashboard from './components/ProjectDashboard'
import { apiService } from './lib/api'

type AppState = 'login' | 'register' | 'home' | 'project'

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