import { useState, useEffect, useRef } from 'react'
import { Heading } from '../atoms/Heading'

interface DashboardHeaderProps {
  userEmail: string
  onLogout: () => void
}

export const DashboardHeader = ({ userEmail, onLogout }: DashboardHeaderProps) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Heading className="text-xl text-gray-800">Welcome to Leonidas</Heading>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="text-2xl "
          >
            👤
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
              <div className="px-4 py-2 border-b">
                <p className="text-sm">{userEmail}</p>
              </div>
              <button 
                onClick={onLogout}
                className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-600"
              >
                [Logout]
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}