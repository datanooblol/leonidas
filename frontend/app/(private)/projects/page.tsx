"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { NewProjectPage } from "../../src/components/pages/NewProjectPage";
import { Spinner } from "../../src/components/atoms/Spinner";
import { apiService } from "../../api/api";

interface ProjectData {
  project_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

function ProjectDetailContent() {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id") || "";

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Set token to apiService
    apiService.setAuthToken(token);

    loadProject();
  }, [projectId, router]);

  const loadProject = async () => {
    try {
      const projectData = await apiService.getProject(projectId);
      setProject(projectData);
    } catch (error) {
      console.error("Failed to load project:", error);
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spinner text="กำลังโหลดโปรเจค..." />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">ไม่พบโปรเจค</h2>
          <button
            onClick={handleBack}
            className="text-gray-600 hover:text-blue-500"
          >
            กลับไปหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return <NewProjectPage project={project} onBack={handleBack} />;
}

export default function ProjectDetail() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ProjectDetailContent />
    </Suspense>
  );
}
