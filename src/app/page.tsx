// Created: 2025-01-28
// v2.0 - Initial creation
// Purpose: Root page — redirects authenticated users to /dashboard, others to /login.

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? "/dashboard" : "/login");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="terminal-blink text-accent text-2xl">▊</span>
    </div>
  );
}
