// 'use client'
// import LoginForm from '../../components/LoginForm'
// import { useState } from 'react'

// type AppState = 'login' | 'register' | 'home' | 'project' | 'test'

// export default function TestLogin() {
//     const [appState, setAppState] = useState<AppState>('login')
//     const [userEmail, setUserEmail] = useState('')

//     const handleLogin = (email: string) => {
//     setUserEmail(email)
//     setAppState('home')
//     }
//   const handleSwitchToRegister = () => {
//     setAppState('register')
//   }
// return (<div>
// <LoginForm onLogin={handleLogin} onSwitchToRegister={handleSwitchToRegister} />
// </div>)
// }

// 'use client'
// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { apiService } from '../../lib/api'

// export default function LoginForm() {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState('')
//   const router = useRouter()

//   const handleAuth = async (isLogin: boolean) => {
//     setIsLoading(true)
//     setError('')

//     try {
//       const response = isLogin 
//         ? await apiService.login(email, password)
//         : await apiService.register(email, password)
      
//       // Save token to localStorage
//       localStorage.setItem('access_token', response.access_token)
      
//       // Redirect to projects page
//       router.push('/projects')
//     } catch (error) {
//       setError(isLogin ? 'เข้าสู่ระบบไม่สำเร็จ' : 'สมัครสมาชิกไม่สำเร็จ')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
//       <div className="max-w-md w-full space-y-8 p-8">
//         <div className="text-center">
//           <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
//             Leonidas Project
//           </h2>
//         </div>
        
//         <div className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Email
//             </label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
//               required
//             />
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Password
//             </label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
//               required
//             />
//           </div>

//           {error && (
//             <div className="text-red-600 dark:text-red-400 text-sm">
//               {error}
//             </div>
//           )}

//           <div className="space-y-3">
//             <button
//               onClick={() => handleAuth(true)}
//               disabled={isLoading}
//               className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
//             >
//               {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
//             </button>

//             <button
//               onClick={() => handleAuth(false)}
//               disabled={isLoading}
//               className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
//             >
//               {isLoading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

'use client'
import { useState } from 'react'
import { LoginPage } from '../../src/components/pages/LoginPage'
import { RegisterPage } from '../../src/components/pages/RegisterPage'

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login')

  if (mode === 'register') {
    return <RegisterPage onSwitchToLogin={() => setMode('login')} />
  }

  return <LoginPage onSwitchToRegister={() => setMode('register')} />
}
