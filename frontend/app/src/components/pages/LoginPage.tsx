"use client";
import { AuthTemplate } from "../templates/AuthTemplate";
import { AuthForm } from "../organisms/AuthForm";
import { useEffect } from "react";

interface LoginPageProps {
  onSwitchToRegister?: () => void;
}

export const LoginPage = ({ onSwitchToRegister }: LoginPageProps) => {
  useEffect(() => {
    console.log('LoginPage mounted - JS is working!');
  }, []);
  
  return (
  <AuthTemplate title="Leonidas Project">
    <AuthForm onSwitchToRegister={onSwitchToRegister} />
    <button 
      className="text-gray-600 hover:text-blue-500" 
      onClick={() => console.log('Forgot password clicked')}
    >
      ลืมรหัสผ่าน?
    </button>
  </AuthTemplate>
  );
};
