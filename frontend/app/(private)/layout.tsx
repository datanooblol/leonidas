"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiService } from "../api/api";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("access_token");

    if (!token && pathname !== "/login") {
      router.push("/login");
      return;
    }

    if (token) {
      apiService.setAuthToken(token);
    }
  }, [router, pathname]);

  // Check authentication without state (only in browser)
  if (typeof window === "undefined") {
    return <>{children}</>;
  }

  const token = localStorage.getItem("access_token");

  if (!token && pathname !== "/login") {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}
