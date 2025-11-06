import { Button } from '../atoms/Button'

interface RegisterButtonsProps {
  onRegister: () => void
  onSwitchToLogin: () => void
  isLoading: boolean
}

export const RegisterButtons = ({ onRegister, onSwitchToLogin, isLoading }: RegisterButtonsProps) => (
  <div className="space-y-4">
    <Button onClick={onRegister} disabled={isLoading}>
      {isLoading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
    </Button>
    
    <div className="text-center">
      <Button
        type="button"
        variant="secondary"
        onClick={onSwitchToLogin}
        className="w-auto text-blue-600 dark:text-blue-400 hover:text-blue-500 text-sm"
      >
        มีบัญชีแล้ว? เข้าสู่ระบบ
      </Button>
    </div>
  </div>
)