'use client'
import { AuthTemplate } from '../templates/AuthTemplate'
import { AuthForm } from '../organisms/AuthForm'

interface LoginPageProps {
  onSwitchToRegister?: () => void
}

export const LoginPage = ({ onSwitchToRegister }: LoginPageProps) => (
  <AuthTemplate title="Leonidas Project">
    <AuthForm onSwitchToRegister={onSwitchToRegister} />
  </AuthTemplate>
)