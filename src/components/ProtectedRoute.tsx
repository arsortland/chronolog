// Created: 2025-01-28
// v2.0 - Initial creation
// Purpose: Route guard component. Redirects unauthenticated users to /login.
//          Shows a loading spinner while auth state is being determined.

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="terminal-blink text-accent text-2xl">▊</span>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
