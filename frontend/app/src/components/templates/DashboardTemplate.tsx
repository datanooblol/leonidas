import { DashboardHeader } from '../molecules/DashboardHeader'

interface DashboardTemplateProps {
  userEmail: string
  onLogout: () => void
  children: React.ReactNode
}

export const DashboardTemplate = ({ userEmail, onLogout, children }: DashboardTemplateProps) => (
  <div className="min-h-screen bg-white">
    <DashboardHeader userEmail={userEmail} onLogout={onLogout} />
    {children}
  </div>
)