"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HomePage } from "../../src/components/pages/HomePage";
import { apiService } from "../../api/api";

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Set token to apiService
    apiService.setAuthToken(token);

    const email = localStorage.getItem("user_email") || "user@example.com";
    setUserEmail(email);
    setIsLoading(false);
  }, [router]);

  const handleSelectProject = (projectId: string, project: any) => {
    router.push(`/project?id=/${projectId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_email");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <HomePage
      userEmail={userEmail}
      onSelectProject={handleSelectProject}
      onLogout={handleLogout}
    />
  );
}
