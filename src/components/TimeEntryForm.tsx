// Created: 2025-01-28
// v2.5 - Replace native date input with custom themed DatePicker component
// v2.7 - Replace tiny 'comp' toggle with segmented Billable/Internal entry-type selector
// v2.4 - Add comp mode toggle: hides Customer and WBS/WO fields, submits with wbsWo="COMP"
// Purpose: Time entry form component. Fields: date, customer (autocomplete from codes),
//          hours, description, WBS/WO code (custom dropdown showing customer/project/code/notes).
//          Displays code-level notes (e.g. pricing/ServiceNow info) when a code is selected.
//          Defaults date to today. Submits to Firestore via addEntry callback.
//          Comp mode: toggle hides customer/WBS-WO fields; records internal time (no billing).

"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { format } from "date-fns";
import type { Code } from "../types";
import DatePicker from "./DatePicker";

interface TimeEntryFormProps {
  codes: Code[];
  onAdd: (data: {
    date: string;
    customer: string;
    hours: number;
    description: string;
    wbsWo: string;
    billed: boolean;
    note?: string;
  }) => Promise<void>;
}

export default function TimeEntryForm({ codes, onAdd }: TimeEntryFormProps) {
  const today = format(new Date(), "yyyy-MM-dd");
  const [date, setDate] = useState(today);
  const [customer, setCustomer] = useState("");
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");
  const [wbsWo, setWbsWo] = useState("");
  const [note, setNote] = useState("");
  const [codeOpen, setCodeOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isComp, setIsComp] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setCodeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Build a unique sorted list of customer names from codes
  const customerSuggestions = [...new Set(codes.map((c) => c.customer))].sort();
  // Filter codes to those matching the selected customer, or all if blank
  const filteredCodes = customer
    ? codes.filter((c) => c.customer === customer)
    : codes;
  // Find the currently selected code to show its notes
  const selectedCode = codes.find((c) => c.code === wbsWo);

  // Pre-populate note from code's notes when code changes
  useEffect(() => {
    setNote(selectedCode?.notes ?? "");
  }, [wbsWo]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const h = parseFloat(hours);
    if (isNaN(h) || h <= 0) return;
    if (!isComp && !wbsWo) return;
    setLoading(true);
    try {
      await onAdd({
        date,
        customer: isComp ? "" : customer,
        hours: h,
        description,
        wbsWo: isComp ? "COMP" : wbsWo,
        billed: false,
        note: note.trim() || undefined,
      });
      // Reset form (keep date and comp mode)
      setCustomer("");
      setHours("");
      setDescription("");
      setWbsWo("");
      setNote("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card-accent p-4">
      <div className="text-muted text-xs mb-4 flex items-center justify-between">
        <span className="terminal-prompt">entry.create()</span>
        <div
          style={{
            display: "flex",
            background: "var(--bg-input, var(--bg-secondary))",
            border: "1px solid var(--border)",
            borderRadius: 4,
            overflow: "hidden",
          }}
          title="Entry type: Billable logs customer hours against a WBS/WO code. Internal logs time for yourself (no code needed)."
        >
          <button
            type="button"
            onClick={() => setIsComp(false)}
            style={{
              fontSize: "0.68rem",
              padding: "3px 12px",
              letterSpacing: "0.04em",
              border: "none",
              cursor: "pointer",
              background: !isComp ? "var(--accent)" : "transparent",
              color: !isComp ? "var(--bg-primary, #000)" : "var(--text-dim)",
              fontWeight: !isComp ? 700 : 400,
              transition: "background 0.15s, color 0.15s",
            }}
          >
            Billable
          </button>
          <button
            type="button"
            onClick={() => setIsComp(true)}
            style={{
              fontSize: "0.68rem",
              padding: "3px 12px",
              letterSpacing: "0.04em",
              border: "none",
              borderLeft: "1px solid var(--border)",
              cursor: "pointer",
              background: isComp ? "var(--accent)" : "transparent",
              color: isComp ? "var(--bg-primary, #000)" : "var(--text-dim)",
              fontWeight: isComp ? 700 : 400,
              transition: "background 0.15s, color 0.15s",
            }}
          >
            Internal
          </button>
        </div>
      </div>

      <div
        className={`grid gap-3 ${isComp ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}
      >
        <div>
          <label>Date</label>
          <DatePicker value={date} onChange={setDate} required />
        </div>

        {!isComp && (
          <div>
            <label htmlFor="ef-customer">Customer</label>
            <input
              id="ef-customer"
              type="text"
              list="customer-list"
              required
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="input-field mt-1"
              placeholder="Customer"
              autoComplete="off"
            />
            <datalist id="customer-list">
              {customerSuggestions.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
        )}

        <div>
          <label htmlFor="ef-hours">Hours</label>
          <input
            id="ef-hours"
            type="number"
            step="0.25"
            min="0.25"
            max="24"
            required
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="input-field mt-1"
            placeholder="7.5"
          />
        </div>

        {!isComp && (
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <label>WBS / WO Code</label>
            <button
              type="button"
              onClick={() => setCodeOpen((o) => !o)}
              className="input-field mt-1"
              style={{
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              {selectedCode ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    flexWrap: "wrap",
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      color: "var(--text-dim)",
                      fontSize: "0.72rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {selectedCode.customer}
                  </span>
                  <span style={{ color: "var(--text-dim)" }}>·</span>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {selectedCode.project}
                  </span>
                  <span style={{ color: "var(--text-dim)" }}>·</span>
                  <code
                    style={{
                      color: "var(--accent)",
                      fontSize: "0.78rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {selectedCode.code}
                  </code>
                </span>
              ) : (
                <span style={{ color: "var(--text-dim)" }}>
                  — Select code —
                </span>
              )}
              <span
                style={{
                  color: "var(--text-dim)",
                  fontSize: "0.65rem",
                  flexShrink: 0,
                }}
              >
                {codeOpen ? "▴" : "▾"}
              </span>
            </button>

            {codeOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  minWidth: "100%",
                  width: "max-content",
                  maxWidth: "min(520px, 90vw)",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                  zIndex: 50,
                  maxHeight: 280,
                  overflowY: "auto",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                }}
              >
                {filteredCodes.length === 0 ? (
                  <div
                    style={{
                      padding: "10px 14px",
                      color: "var(--text-dim)",
                      fontSize: "0.78rem",
                    }}
                  >
                    No codes for this customer.
                  </div>
                ) : (
                  filteredCodes.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setWbsWo(c.code);
                        setCodeOpen(false);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "8px 14px",
                        background:
                          wbsWo === c.code
                            ? "var(--bg-hover, rgba(255,255,255,0.06))"
                            : "transparent",
                        border: "none",
                        borderBottom: "1px solid var(--border)",
                        cursor: "pointer",
                        color: "var(--text)",
                      }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background =
                          "var(--bg-hover, rgba(255,255,255,0.06))";
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background =
                          wbsWo === c.code
                            ? "var(--bg-hover, rgba(255,255,255,0.06))"
                            : "transparent";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            color: "var(--text-dim)",
                            fontSize: "0.72rem",
                          }}
                        >
                          {c.customer}
                        </span>
                        <span
                          style={{
                            color: "var(--text-dim)",
                            fontSize: "0.65rem",
                          }}
                        >
                          ·
                        </span>
                        <span style={{ fontSize: "0.8rem" }}>{c.project}</span>
                        <span
                          style={{
                            color: "var(--text-dim)",
                            fontSize: "0.65rem",
                          }}
                        >
                          ·
                        </span>
                        <code
                          style={{
                            color: "var(--accent)",
                            fontSize: "0.75rem",
                          }}
                        >
                          {c.code}
                        </code>
                        <span
                          style={{
                            fontSize: "0.62rem",
                            padding: "1px 5px",
                            border: "1px solid var(--border)",
                            color: "var(--text-dim)",
                            borderRadius: 2,
                          }}
                        >
                          {c.type}
                        </span>
                      </div>
                      {c.notes && (
                        <div
                          style={{
                            marginTop: 3,
                            color: "var(--text-dim)",
                            fontSize: "0.7rem",
                            lineHeight: 1.4,
                          }}
                        >
                          {c.notes}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-3">
        <label htmlFor="ef-desc">Description</label>
        <input
          id="ef-desc"
          type="text"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field mt-1"
          placeholder="What did you work on?"
        />
      </div>

      {selectedCode?.notes && (
        <div
          className="mt-3"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--accent)",
            borderRadius: 4,
            padding: "8px 12px",
            fontSize: "0.78rem",
            color: "var(--text-muted)",
            lineHeight: 1.5,
          }}
        >
          <span
            style={{
              color: "var(--accent)",
              fontWeight: 700,
              marginRight: 6,
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            code note:
          </span>
          {selectedCode.notes}
        </div>
      )}

      <div className="mt-3">
        <label htmlFor="ef-note">Note</label>
        <input
          id="ef-note"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="input-field mt-1"
          placeholder="Optional note for this entry"
        />
      </div>

      <div className="mt-4 flex justify-end">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Adding..." : "+ Add Entry"}
        </button>
      </div>
    </form>
  );
}
