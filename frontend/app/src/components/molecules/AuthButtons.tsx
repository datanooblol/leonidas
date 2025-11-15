import { Button } from '../atoms/Button'

interface AuthButtonsProps {
  onLogin: () => void
  onRegister: () => void
  isLoading: boolean
}

export const AuthButtons = ({ onLogin, onRegister, isLoading }: AuthButtonsProps) => (
  <div className="space-y-3">
    <Button onClick={onLogin} disabled={isLoading}>
      {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
    </Button>
    
    <Button variant="secondary" onClick={onRegister} disabled={isLoading}>
      {isLoading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
    </Button>
  </div>
)