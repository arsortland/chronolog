// Created: 2025-01-28
// v2.0 - Initial creation
// Purpose: Global error boundary for the ChronoLog App Router. Catches
//          uncaught render errors that escape all nested error boundaries
//          and provides a user-facing "Try again" recovery action.

"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-accent font-mono text-lg">Something went wrong.</p>
      <button
        onClick={reset}
        className="text-sm underline font-mono opacity-70 hover:opacity-100"
      >
        Try again
      </button>
    </div>
  );
}
