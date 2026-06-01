// Created: 2025-01-28
// v2.0 - Initial creation
// Purpose: CopyButton component. Copies a given text value to the clipboard.
//          Shows a brief "Copied!" flash for 1.5s after clicking.

"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  value: string;
}

export default function CopyButton({ value }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* silently fail if clipboard not available */
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="btn-icon"
      title="Copy to clipboard"
      aria-label="Copy"
      style={{ color: copied ? "var(--accent)" : undefined }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}
