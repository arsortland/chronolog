// Created: 2025-01-28
// v2.0 - Initial creation
// Purpose: Loading UI for dashboard routes. This file is required to cause
//          Next.js App Router to wrap the dashboard layout in a <Suspense>
//          boundary. Without it, navigation hooks (usePathname, useRouter)
//          that internally call React's use() can throw a SuspenseException
//          that has no boundary to catch it, producing React error #460.

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <span
        className="text-accent text-2xl font-mono"
        style={{ animation: "blink 1s step-start infinite" }}
      >
        ▊
      </span>
    </div>
  );
}
