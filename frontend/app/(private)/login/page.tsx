// 'use client'
// import { useState } from 'react'
// import { LoginPage } from '../../src/components/pages/LoginPage'
// import { RegisterPage } from '../../src/components/pages/RegisterPage'

// export default function Login() {
//   const [mode, setMode] = useState<'login' | 'register'>('login')

//   if (mode === 'register') {
//     return <RegisterPage onSwitchToLogin={() => setMode('login')} />
//   }

//   return <LoginPage onSwitchToRegister={() => setMode('register')} />
// }
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginPage } from "../../src/components/pages/LoginPage";
import { RegisterPage } from "../../src/components/pages/RegisterPage";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  if (mode === "register") {
    return <RegisterPage onSwitchToLogin={() => setMode("login")} />;
  }

  return <LoginPage onSwitchToRegister={() => setMode("register")} />;
}
