import { DashboardHeader } from '../molecules/DashboardHeader'

interface DashboardTemplateProps {
  userEmail: string
  onLogout: () => void
  children: React.ReactNode
}

export const DashboardTemplate = ({ userEmail, onLogout, children }: DashboardTemplateProps) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <DashboardHeader userEmail={userEmail} onLogout={onLogout} />
    {children}
  </div>
)