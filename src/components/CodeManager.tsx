// Created: 2025-01-28
// v2.1 - Added notes field to codes (pricing/ServiceNow reference info per code)
// Purpose: CodeManager component. Displays a table of WBS/WO codes for the current user.
//          Includes an inline add form (code, customer, project, type, notes) and a
//          delete button per row. Uses the useCodes hook for Firestore CRUD.

"use client";

import { useState, FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { useCodes } from "../hooks/useCodes";
import type { Code } from "../types";

export default function CodeManager() {
  const { codes, loading, addCode, deleteCode } = useCodes();
  const [form, setForm] = useState<Omit<Code, "id">>({
    code: "",
    customer: "",
    project: "",
    type: "WBS",
  });
  const [saving, setSaving] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!form.code || !form.customer || !form.project) return;
    setSaving(true);
    try {
      await addCode({ ...form, notes: form.notes || undefined });
      setForm({ code: "", customer: "", project: "", type: "WBS", notes: "" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="card p-4 mb-6">
        <div className="terminal-prompt text-xs mb-4">codes.add()</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label htmlFor="cm-code">Code</label>
            <input
              id="cm-code"
              required
              className="input-field mt-1"
              placeholder="WBS-1234"
              value={form.code}
              onChange={(e) => set("code", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="cm-customer">Customer</label>
            <input
              id="cm-customer"
              required
              className="input-field mt-1"
              placeholder="Acme Corp"
              value={form.customer}
              onChange={(e) => set("customer", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="cm-project">Project</label>
            <input
              id="cm-project"
              required
              className="input-field mt-1"
              placeholder="Project name"
              value={form.project}
              onChange={(e) => set("project", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="cm-type">Type</label>
            <select
              id="cm-type"
              className="input-field mt-1"
              value={form.type}
              onChange={(e) => set("type", e.target.value as "WBS" | "WO")}
            >
              <option value="WBS">WBS</option>
              <option value="WO">WO</option>
            </select>
          </div>
        </div>
        <div className="mt-3">
          <label htmlFor="cm-notes">Notes (optional)</label>
          <input
            id="cm-notes"
            className="input-field mt-1"
            placeholder="Pricing, ServiceNow reference, special instructions..."
            value={form.notes ?? ""}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>
        <div className="mt-3 flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving..." : "+ Add Code"}
          </button>
        </div>
      </form>

      {loading ? (
        <p style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}>
          Loading codes...
        </p>
      ) : codes.length === 0 ? (
        <p style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}>
          No codes yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.8rem",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Code", "Customer", "Project", "Type", "Notes", ""].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "4px 8px",
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
              {codes.map((c) => (
                <tr key={c.id}>
                  <td style={{ padding: "6px 8px" }}>
                    <code style={{ fontSize: "0.78rem" }}>{c.code}</code>
                  </td>
                  <td style={{ padding: "6px 8px" }}>{c.customer}</td>
                  <td style={{ padding: "6px 8px" }}>{c.project}</td>
                  <td style={{ padding: "6px 8px" }}>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        padding: "1px 6px",
                        border: "1px solid var(--accent)",
                        color: "var(--accent)",
                        borderRadius: 2,
                      }}
                    >
                      {c.type}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "6px 8px",
                      color: "var(--text-muted)",
                      fontSize: "0.75rem",
                    }}
                  >
                    {c.notes ?? "—"}
                  </td>
                  <td style={{ padding: "6px 8px" }}>
                    <button
                      onClick={() => deleteCode(c.id!)}
                      className="btn-icon"
                      title="Delete code"
                      aria-label="Delete code"
                      style={{ color: "var(--danger)" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
