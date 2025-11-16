"use client";
// import { useEffect } from "react";
// import { useRouter, redirect } from "next/navigation";
import { redirect } from "next/navigation";
export default function RootPage() {
  redirect("/login");
  // const router = useRouter()

  // useEffect(() => {
  //   const token = localStorage.getItem('access_token')
  //   if (token) {
  //     router.push('/dashboard')
  //   } else {
  //     router.push('/login')
  //   }
  // }, [router])

  // return <div className="min-h-screen bg-white flex items-center justify-center">กำลังโหลด...</div>
}
