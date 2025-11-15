'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { InputField } from '../molecules/InputField'
import { RegisterButtons } from '../molecules/RegisterButtons'
import { ErrorMessage } from '../atoms/ErrorMessage'
import { apiService } from '../../../api/api'

export const RegisterForm = ({ onSwitchToLogin }: { onSwitchToLogin: () => void }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleRegister = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await apiService.register(email, password)
      localStorage.setItem('access_token', response.access_token)
      router.push('/dashboard')
    } catch (error) {
      setError('สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <InputField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
      <InputField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <ErrorMessage message={error} />
      
      <RegisterButtons
        onRegister={handleRegister}
        onSwitchToLogin={onSwitchToLogin}
        isLoading={isLoading}
      />
    </div>
  )
}