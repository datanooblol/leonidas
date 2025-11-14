import { DashboardHeader } from '../molecules/DashboardHeader'

interface DashboardTemplateProps {
  userEmail: string
  onLogout: () => void
  children: React.ReactNode
}

export const DashboardTemplate = ({ userEmail, onLogout, children }: DashboardTemplateProps) => (
  <div className="h-screen bg-white flex flex-col">
    <DashboardHeader userEmail={userEmail} onLogout={onLogout} />
    <div className="flex-1 overflow-hidden">
      {children}
    </div>
  </div>
)