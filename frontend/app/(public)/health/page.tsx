"use client";

import { useEffect, useState } from "react";

export default function HealthPage() {
  const [status, setStatus] = useState<string>("");
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  // test1
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        // console.log("API URL:", apiUrl);
        const response = await fetch(`${apiUrl}/health`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        setStatus(data.status);
        setHttpStatus(response.status);
      } catch (error) {
        setStatus(
          `Error: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        setHttpStatus(null);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  if (loading) return <div>Loading....</div>;

  return (
    <div>
      <h1>Health Check</h1>
      <p>Status: {status}</p>
      <p>HTTP Status: {httpStatus}</p>
    </div>
  );
}
