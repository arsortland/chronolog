// Created: 2025-01-28
// v2.2 - Increased column spacing (header padding)
// v2.3 - Added Note column header and onUpdateNote prop threading
// v2.4 - Format group date header as dd.MM.yyyy with more spacing
// v2.6 - Rename "Billed" header to "Status"
// Purpose: TimeEntryList component. Renders a list of time entries grouped by date.
//          Each group has a date header followed by an EntryRow table.

"use client";

import EntryRow from "./EntryRow";
import type { Entry } from "../types";

interface TimeEntryListProps {
  entries: Entry[];
  onDelete: (id: string) => void;
  onToggleBilled: (id: string, current: boolean) => void;
  onUpdateNote: (id: string, note: string) => void;
}

const TABLE_HEADERS = [
  "",
  "Date",
  "Customer",
  "Hours",
  "Description",
  "WBS/WO",
  "Status",
  "Note",
  "",
];

export default function TimeEntryList({
  entries,
  onDelete,
  onToggleBilled,
  onUpdateNote,
}: TimeEntryListProps) {
  if (entries.length === 0) {
    return (
      <p
        style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}
        className="text-center py-8"
      >
        No entries found.
      </p>
    );
  }

  // Group entries by date descending
  const groups = new Map<string, Entry[]>();
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  for (const entry of sorted) {
    if (!groups.has(entry.date)) groups.set(entry.date, []);
    groups.get(entry.date)!.push(entry);
  }

  return (
    <div className="overflow-x-auto">
      {[...groups.entries()].map(([date, dayEntries]) => (
        <div key={date} className="mb-6">
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.8rem",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {TABLE_HEADERS.map((h, i) => (
                  <th
                    key={i}
                    style={{
                      textAlign: "left",
                      padding: "6px 8px",
                      color: "var(--text-dim)",
                      fontWeight: 600,
                      fontSize: "0.68rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dayEntries.map((entry) => (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  onDelete={onDelete}
                  onToggleBilled={onToggleBilled}
                  onUpdateNote={onUpdateNote}
                />
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
