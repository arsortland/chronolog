// Created: 2025-01-28
// v2.1 - Add period quick filters (Today/This Week/This Month) and summary stats
//         (total registered hours + billing rate) for the filtered result set.
// v2.2 - Wire updateNote to TimeEntryList
// v2.3 - Add "Last Week" period filter button
// v2.4 - Add "Last Month" period filter button
// Purpose: History page. Shows all time entries with filters for billed/unbilled status,
//          period quick-select (today/week/month) and a manual date range (from/to).
//          Displays summary stats: total hours and billing rate for the filtered set.

"use client";

import { useState, useMemo } from "react";
import { format, startOfWeek, endOfWeek, subWeeks, startOfMonth, endOfMonth, subMonths } from "date-fns";
import TimeEntryList from "../../../components/TimeEntryList";
import { useEntries } from "../../../hooks/useEntries";

type Filter = "all" | "billed" | "unbilled";
type Period = "today" | "week" | "lastweek" | "month" | "lastmonth" | "custom";

export default function HistoryPage() {
  const { entries, loading, deleteEntry, toggleBilled, updateNote } = useEntries();
  const [filter, setFilter] = useState<Filter>("all");
  const [period, setPeriod] = useState<Period>("custom");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const today = format(new Date(), "yyyy-MM-dd");
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const lastWeekStart = format(startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const lastWeekEnd = format(endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const lastMonthStart = format(startOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd");
  const lastMonthEnd = format(endOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd");

  function selectPeriod(p: Period) {
    setPeriod(p);
    switch (p) {
      case "today":
        setFrom(today);
        setTo(today);
        break;
      case "week":
        setFrom(weekStart);
        setTo(today);
        break;
      case "lastweek":
        setFrom(lastWeekStart);
        setTo(lastWeekEnd);
        break;
      case "month":
        setFrom(monthStart);
        setTo(today);
        break;
      case "lastmonth":
        setFrom(lastMonthStart);
        setTo(lastMonthEnd);
        break;
      case "custom":
        // keep existing from/to
        break;
    }
  }

  function handleFromChange(val: string) {
    setFrom(val);
    setPeriod("custom");
  }

  function handleToChange(val: string) {
    setTo(val);
    setPeriod("custom");
  }

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (filter === "billed" && !e.billed) return false;
      if (filter === "unbilled" && e.billed) return false;
      if (from && e.date < from) return false;
      if (to && e.date > to) return false;
      return true;
    });
  }, [entries, filter, from, to]);

  const totalHours = useMemo(
    () => filtered.reduce((sum, e) => sum + e.hours, 0),
    [filtered],
  );

  const billingRate = useMemo(() => {
    if (totalHours === 0) return null;
    const billable = filtered
      .filter((e) => e.wbsWo !== "COMP")
      .reduce((sum, e) => sum + e.hours, 0);
    return Math.round((billable / totalHours) * 100);
  }, [filtered, totalHours]);

  const filterButtons: { label: string; value: Filter }[] = [
    { label: "All", value: "all" },
    { label: "Unbilled", value: "unbilled" },
    { label: "Billed", value: "billed" },
  ];

  const periodButtons: { label: string; value: Period }[] = [
    { label: "Today", value: "today" },
    { label: "This Week", value: "week" },
    { label: "Last Week", value: "lastweek" },
    { label: "This Month", value: "month" },
    { label: "Last Month", value: "lastmonth" },
  ];

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
        <span className="text-dim">~/</span>history
      </h1>

      <div className="card p-3 mb-4 flex flex-wrap items-end gap-4">
        {/* Status filter */}
        <div className="flex gap-1">
          {filterButtons.map((b) => (
            <button
              key={b.value}
              onClick={() => setFilter(b.value)}
              className={filter === b.value ? "btn-primary" : "btn-ghost"}
              style={{ fontSize: "0.72rem", padding: "4px 10px" }}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Period quick-select */}
        <div className="flex gap-1">
          {periodButtons.map((b) => (
            <button
              key={b.value}
              onClick={() => selectPeriod(b.value)}
              className={period === b.value ? "btn-primary" : "btn-ghost"}
              style={{ fontSize: "0.72rem", padding: "4px 10px" }}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Manual date range */}
        <div className="flex items-end gap-2 ml-auto">
          <div>
            <label
              style={{
                fontSize: "0.65rem",
                color: "var(--text-dim)",
                display: "block",
              }}
            >
              From
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => handleFromChange(e.target.value)}
              className="input-field"
              style={{ width: "auto" }}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: "0.65rem",
                color: "var(--text-dim)",
                display: "block",
              }}
            >
              To
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => handleToChange(e.target.value)}
              className="input-field"
              style={{ width: "auto" }}
            />
          </div>
          {(from || to) && (
            <button
              onClick={() => {
                setFrom("");
                setTo("");
                setPeriod("custom");
              }}
              className="btn-ghost"
              style={{ fontSize: "0.72rem", padding: "4px 10px" }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex gap-3 mb-4">
        <div className="card px-4 py-2 text-center">
          <div
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "var(--accent)",
            }}
          >
            {totalHours.toFixed(1)}
          </div>
          <div
            style={{
              fontSize: "0.62rem",
              color: "var(--text-dim)",
              textTransform: "uppercase",
            }}
          >
            hours
          </div>
        </div>
        <div className="card px-4 py-2 text-center">
          <div
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color:
                billingRate !== null && billingRate < 50
                  ? "var(--danger)"
                  : "var(--accent)",
            }}
          >
            {billingRate !== null ? `${billingRate}%` : "—"}
          </div>
          <div
            style={{
              fontSize: "0.62rem",
              color: "var(--text-dim)",
              textTransform: "uppercase",
            }}
          >
            billing rate
          </div>
        </div>
        <div
          className="card px-4 py-2 text-center"
          style={{ marginLeft: "auto" }}
        >
          <div
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "var(--text-dim)",
            }}
          >
            {filtered.length}
          </div>
          <div
            style={{
              fontSize: "0.62rem",
              color: "var(--text-dim)",
              textTransform: "uppercase",
            }}
          >
            entries
          </div>
        </div>
      </div>

      <div className="terminal-prompt text-xs mb-4">
        entries.list({filter !== "all" ? `billed=${filter === "billed"}` : ""}
        {from ? `, from="${from}"` : ""}
        {to ? `, to="${to}"` : ""}) → {filtered.length} results
      </div>

      {loading ? (
        <p style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}>
          Loading...
        </p>
      ) : (
        <TimeEntryList
          entries={filtered}
          onDelete={deleteEntry}
          onToggleBilled={toggleBilled}
          onUpdateNote={updateNote}
        />
      )}
    </div>
  );
}
