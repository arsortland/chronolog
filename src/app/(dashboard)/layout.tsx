// Created: 2025-01-28
// v2.0 - Initial creation
// Purpose: Shared layout for all dashboard routes.
//          Wraps children with ProtectedRoute and renders the Navbar.

"use client";

import ProtectedRoute from "../../components/ProtectedRoute";
import Navbar from "../../components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 p-4 w-full">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
