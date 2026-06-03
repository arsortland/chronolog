// Created: 2025-01-28
// v2.2 - Increased column spacing (header padding)
// v2.3 - Added Note column header and onUpdateNote prop threading
// v2.4 - Format group date header as dd.MM.yyyy with more spacing
// v2.6 - Rename "Billed" header to "Status"
// v2.7 - Add table-layout:fixed + colgroup so all date-group tables share identical column widths
// v2.8 - Give Description col explicit 150px width (was unsized, causing 0px collapse on mobile)
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
              minWidth: 842,
              borderCollapse: "collapse",
              fontSize: "0.8rem",
              tableLayout: "fixed",
            }}
          >
            {/* indicator / Date / Customer / Hours / Description / WBS/WO / Status / Note / Delete */}
            <colgroup>
              <col style={{ width: "24px" }} />
              <col style={{ width: "92px" }} />
              <col style={{ width: "130px" }} />
              <col style={{ width: "60px" }} />
              <col style={{ width: "150px" }} />
              <col style={{ width: "90px" }} />
              <col style={{ width: "100px" }} />
              <col style={{ width: "140px" }} />
              <col style={{ width: "56px" }} />
            </colgroup>
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
