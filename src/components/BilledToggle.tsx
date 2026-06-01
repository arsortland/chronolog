// Created: 2025-01-28
// v2.0 - Initial creation
// v2.1 - Add optional checkedText/uncheckedText props for COMP "Reported" toggle
// Purpose: BilledToggle component. Renders a checkbox that toggles an entry's
//          billed/unbilled status in Firestore via the provided callback.

"use client";

interface BilledToggleProps {
  id: string;
  billed: boolean;
  onToggle: (id: string, current: boolean) => void;
  checkedText?: string;
  uncheckedText?: string;
}

export default function BilledToggle({
  id,
  billed,
  onToggle,
  checkedText = "BILLED",
  uncheckedText = "OPEN",
}: BilledToggleProps) {
  return (
    <label
      className="flex items-center gap-1 cursor-pointer select-none"
      title={billed ? checkedText : uncheckedText}
    >
      <input
        type="checkbox"
        checked={billed}
        onChange={() => onToggle(id, billed)}
        style={{ accentColor: "var(--accent)", width: 14, height: 14 }}
      />
      <span
        style={{
          fontSize: "0.65rem",
          color: billed ? "var(--accent)" : "var(--text-dim)",
        }}
      >
        {billed ? checkedText : uncheckedText}
      </span>
    </label>
  );
}
