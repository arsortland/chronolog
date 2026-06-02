// Created: 2025-01-28
// v2.3 - COMP entry rendering: badge instead of code, dimmed customer, hidden billed toggle
// v2.4 - Added inline editable note cell as the rightmost column before delete
// v2.5 - Format date column as dd.MM.yyyy
// v2.6 - Add leading > indicator: red when unbilled, green when billed
// v2.8 - Apply billed-row green background to COMP (internal) entries when billed
// Purpose: EntryRow component. Renders a single time entry as a table row.
//          Shows date, customer, hours, description, WBS/WO, billed toggle, delete.
//          Each copyable field has a CopyButton. Row highlights when billed.
//          Delete requires a two-step confirm (confirm/cancel inline buttons).
//          COMP entries (wbsWo=="COMP") show a comp badge, blank customer, and no billed toggle.

"use client";

import React from "react";
import { format, parseISO } from "date-fns";
import { Trash2, Check, X } from "lucide-react";
import CopyButton from "./CopyButton";
import BilledToggle from "./BilledToggle";
import type { Entry } from "../types";

interface EntryRowProps {
  entry: Entry;
  onDelete: (id: string) => void;
  onToggleBilled: (id: string, current: boolean) => void;
  onUpdateNote: (id: string, note: string) => void;
}

const TD = { padding: "6px 8px" } as React.CSSProperties;

export default function EntryRow({
  entry,
  onDelete,
  onToggleBilled,
  onUpdateNote,
}: EntryRowProps) {
  const [confirming, setConfirming] = React.useState(false);
  const [noteDraft, setNoteDraft] = React.useState(entry.note ?? "");
  const isComp = entry.wbsWo === "COMP";

  function handleNoteBlur() {
    const trimmed = noteDraft.trim();
    if (trimmed !== (entry.note ?? "").trim()) {
      onUpdateNote(entry.id!, trimmed);
    }
  }

  function handleNoteKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  }

  return (
    <tr className={entry.billed ? "billed-row" : ""}>
      <td style={{ ...TD, width: "1rem", paddingRight: 0 }}>
        <span
          style={{
            color: entry.billed ? "var(--accent)" : "var(--danger)",
            fontWeight: 700,
            fontSize: "0.8rem",
          }}
        >
          {">"}
        </span>
      </td>
      <td style={{ ...TD, whiteSpace: "nowrap" }}>
        {format(parseISO(entry.date), "dd.MM.yyyy")}
      </td>
      <td style={TD}>
        {isComp ? (
          <span style={{ color: "var(--text-dim)" }}>—</span>
        ) : (
          entry.customer
        )}
      </td>
      <td style={TD}>
        <span className="flex items-center gap-1">
          {entry.hours}
          <CopyButton value={String(entry.hours)} />
        </span>
      </td>
      <td style={TD}>
        <span className="flex items-center gap-1">
          {entry.description}
          <CopyButton value={entry.description} />
        </span>
      </td>
      <td style={TD}>
        {isComp ? (
          <span
            style={{
              fontSize: "0.68rem",
              padding: "1px 7px",
              border: "1px solid var(--accent)",
              color: "var(--accent)",
              borderRadius: 2,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            internal
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <code style={{ fontSize: "0.72rem" }}>{entry.wbsWo}</code>
            <CopyButton value={entry.wbsWo} />
          </span>
        )}
      </td>
      <td style={TD}>
        {isComp ? (
          <BilledToggle
            id={entry.id!}
            billed={entry.billed}
            onToggle={onToggleBilled}
            checkedText="REPORTED"
            uncheckedText="OPEN"
          />
        ) : (
          <BilledToggle
            id={entry.id!}
            billed={entry.billed}
            onToggle={onToggleBilled}
          />
        )}
      </td>
      <td style={{ ...TD, minWidth: 140, maxWidth: 220 }}>
        <input
          type="text"
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          onBlur={handleNoteBlur}
          onKeyDown={handleNoteKeyDown}
          placeholder="add note…"
          style={{
            background: "transparent",
            border: "none",
            borderBottom: "1px solid transparent",
            color: noteDraft ? "var(--text)" : "var(--text-dim)",
            fontSize: "0.78rem",
            width: "100%",
            outline: "none",
            padding: "2px 0",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderBottomColor =
              "var(--border-accent, var(--accent))";
          }}
          onBlurCapture={(e) => {
            e.currentTarget.style.borderBottomColor = "transparent";
          }}
        />
      </td>
      <td style={{ ...TD, whiteSpace: "nowrap" }}>
        {confirming ? (
          <span className="flex items-center gap-1">
            <button
              onClick={() => onDelete(entry.id!)}
              className="btn-icon"
              title="Confirm delete"
              aria-label="Confirm delete"
              style={{ color: "var(--danger)" }}
            >
              <Check size={14} />
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="btn-icon"
              title="Cancel"
              aria-label="Cancel delete"
              style={{ color: "var(--text-dim)" }}
            >
              <X size={14} />
            </button>
          </span>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="btn-icon"
            title="Delete entry"
            aria-label="Delete entry"
            style={{ color: "var(--danger)" }}
          >
            <Trash2 size={14} />
          </button>
        )}
      </td>
    </tr>
  );
}
