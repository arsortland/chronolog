// Created: 2025-01-28
// v2.0 - Initial creation
// Purpose: Codes settings page. Displays the CodeManager component for managing
//          WBS/WO codes. Accessible at /codes within the dashboard route group.

"use client";

import CodeManager from "../../../components/CodeManager";

export default function CodesPage() {
  return (
    <div className="py-4">
      <h1
        style={{
          color: "var(--accent)",
          fontSize: "1.1rem",
          fontWeight: 700,
          marginBottom: "1.5rem",
        }}
      >
        <span className="text-dim">~/</span>codes
      </h1>
      <CodeManager />
    </div>
  );
}
