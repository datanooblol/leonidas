"use client";
import { AuthTemplate } from "../templates/AuthTemplate";
import { RegisterForm } from "../organisms/RegisterForm";

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export const RegisterPage = ({ onSwitchToLogin }: RegisterPageProps) => (
  <AuthTemplate title="Register">
    <RegisterForm onSwitchToLogin={onSwitchToLogin} />
  </AuthTemplate>
);
