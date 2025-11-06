import { Heading } from '../atoms/Heading'
import { Button } from '../atoms/Button'

interface DashboardHeaderProps {
  userEmail: string
  onLogout: () => void
}

export const DashboardHeader = ({ userEmail, onLogout }: DashboardHeaderProps) => (
  <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
    <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
      <div>
        <Heading className="text-2xl">Welcome to Leonidas</Heading>
        <p className="text-sm text-gray-600 dark:text-gray-400">Hello {userEmail}</p>
      </div>
      <Button 
        variant="secondary" 
        onClick={onLogout}
        className="w-auto px-4 py-2 text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        Logout
      </Button>
    </div>
  </div>
)