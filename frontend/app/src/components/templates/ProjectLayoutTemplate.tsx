import React from 'react'
import { Navbar } from '../atoms/Navbar'

interface ProjectLayoutTemplateProps {
  projectName: string
  leftPanel: React.ReactNode
  rightPanel: React.ReactNode
  onBack: () => void
}

export const ProjectLayoutTemplate = ({
  projectName,
  leftPanel,
  rightPanel,
  onBack
}: ProjectLayoutTemplateProps) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
    <Navbar projectName={projectName} onBack={onBack} />
    
    <div className="flex-1 flex">
      {/* Left Panel - 200px fixed width */}
      <div className="w-[200px] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
        {leftPanel}
      </div>
      
      {/* Right Panel - remaining space */}
      <div className="flex-1 flex flex-col">
        {rightPanel}
      </div>
    </div>
  </div>
)