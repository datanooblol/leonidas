'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { InputField } from '../molecules/InputField'
import { AuthButtons } from '../molecules/AuthButtons'
import { ErrorMessage } from '../atoms/ErrorMessage'
import { apiService } from '../../../lib/api'

export const AuthForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleAuth = async (isLogin: boolean) => {
    setIsLoading(true)
    setError('')

    try {
      const response = isLogin 
        ? await apiService.login(email, password)
        : await apiService.register(email, password)
      
      localStorage.setItem('access_token', response.access_token)
      router.push('/projects')
    } catch (error) {
      setError(isLogin ? 'เข้าสู่ระบบไม่สำเร็จ' : 'สมัครสมาชิกไม่สำเร็จ')
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
      
      <AuthButtons
        onLogin={() => handleAuth(true)}
        onRegister={() => handleAuth(false)}
        isLoading={isLoading}
      />
    </div>
  )
}