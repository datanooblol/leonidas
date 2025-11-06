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
  <div className="min-h-screen bg-white flex flex-col">
    <Navbar projectName={projectName} onBack={onBack} />
    
    <div className="flex-1 flex">
      {/* Left Panel - 200px fixed width */}
      <div className="w-[200px] bg-gray-100 border-r border-gray-300 p-4">
        {leftPanel}
      </div>
      
      {/* Right Panel - remaining space */}
      <div className="flex-1 flex flex-col">
        {rightPanel}
      </div>
    </div>
  </div>
)