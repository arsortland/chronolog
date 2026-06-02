// Created: 2025-01-28
// v2.1 - Add period quick filters (Today/This Week/This Month) and summary stats
//         (total registered hours + billing rate) for the filtered result set.
// v2.2 - Wire updateNote to TimeEntryList
// v2.3 - Add "Last Week" period filter button
// v2.4 - Add "Last Month" period filter button
// v2.5 - Add search, customer filter, code filter, and hours breakdown by customer/code
// Purpose: History page. Shows all time entries with filters for billed/unbilled status,
//          period quick-select (today/week/month), manual date range, free-text search,
//          customer/code dropdowns, and a breakdown table of hours per customer and code.

"use client";

import { useState, useMemo } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  subWeeks,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";
import TimeEntryList from "../../../components/TimeEntryList";
import { useEntries } from "../../../hooks/useEntries";

type Filter = "all" | "billed" | "unbilled";
type Period = "today" | "week" | "lastweek" | "month" | "lastmonth" | "custom";

export default function HistoryPage() {
  const { entries, loading, deleteEntry, toggleBilled, updateNote } =
    useEntries();
  const [filter, setFilter] = useState<Filter>("all");
  const [period, setPeriod] = useState<Period>("custom");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [codeFilter, setCodeFilter] = useState("");
  const [showBreakdown, setShowBreakdown] = useState(false);

  const today = format(new Date(), "yyyy-MM-dd");
  const weekStart = format(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
    "yyyy-MM-dd",
  );
  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const lastWeekStart = format(
    startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }),
    "yyyy-MM-dd",
  );
  const lastWeekEnd = format(
    endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }),
    "yyyy-MM-dd",
  );
  const lastMonthStart = format(
    startOfMonth(subMonths(new Date(), 1)),
    "yyyy-MM-dd",
  );
  const lastMonthEnd = format(
    endOfMonth(subMonths(new Date(), 1)),
    "yyyy-MM-dd",
  );

  // Unique customers and codes derived from all entries (for dropdown options)
  const allCustomers = useMemo(
    () =>
      Array.from(
        new Set(entries.map((e) => e.customer).filter(Boolean)),
      ).sort(),
    [entries],
  );
  const allCodes = useMemo(
    () =>
      Array.from(new Set(entries.map((e) => e.wbsWo).filter(Boolean))).sort(),
    [entries],
  );

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
    const q = search.toLowerCase();
    return entries.filter((e) => {
      if (filter === "billed" && !e.billed) return false;
      if (filter === "unbilled" && e.billed) return false;
      if (from && e.date < from) return false;
      if (to && e.date > to) return false;
      if (customerFilter && e.customer !== customerFilter) return false;
      if (codeFilter && e.wbsWo !== codeFilter) return false;
      if (q) {
        const haystack = [e.customer, e.wbsWo, e.description, e.note ?? ""]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [entries, filter, from, to, customerFilter, codeFilter, search]);

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

  // Breakdown: hours grouped by customer
  const byCustomer = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((e) => {
      map.set(e.customer, (map.get(e.customer) ?? 0) + e.hours);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  // Breakdown: hours grouped by code
  const byCode = useMemo(() => {
    const map = new Map<string, { hours: number; customer: string }>();
    filtered.forEach((e) => {
      const existing = map.get(e.wbsWo);
      map.set(e.wbsWo, {
        hours: (existing?.hours ?? 0) + e.hours,
        customer: e.customer,
      });
    });
    return Array.from(map.entries()).sort((a, b) => b[1].hours - a[1].hours);
  }, [filtered]);

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

  const selectStyle: React.CSSProperties = {
    background: "var(--bg-card)",
    color: "var(--text-primary)",
    border: "1px solid var(--border)",
    borderRadius: "4px",
    padding: "4px 8px",
    fontSize: "0.72rem",
    fontFamily: "inherit",
    cursor: "pointer",
  };

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

      <div className="card p-3 mb-4 flex flex-col gap-3">
        {/* Row 1: status + period + date range */}
        <div className="flex flex-wrap items-end gap-4">
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

        {/* Row 2: search + customer + code */}
        <div className="flex flex-wrap items-end gap-3">
          {/* Search */}
          <div style={{ flex: "1 1 200px" }}>
            <label
              style={{
                fontSize: "0.65rem",
                color: "var(--text-dim)",
                display: "block",
                marginBottom: "2px",
              }}
            >
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="customer, code, description…"
              className="input-field"
              style={{ width: "100%" }}
            />
          </div>

          {/* Customer filter */}
          <div>
            <label
              style={{
                fontSize: "0.65rem",
                color: "var(--text-dim)",
                display: "block",
                marginBottom: "2px",
              }}
            >
              Customer
            </label>
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="">All customers</option>
              {allCustomers.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Code filter */}
          <div>
            <label
              style={{
                fontSize: "0.65rem",
                color: "var(--text-dim)",
                display: "block",
                marginBottom: "2px",
              }}
            >
              Code
            </label>
            <select
              value={codeFilter}
              onChange={(e) => setCodeFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="">All codes</option>
              {allCodes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {(search || customerFilter || codeFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setCustomerFilter("");
                setCodeFilter("");
              }}
              className="btn-ghost"
              style={{ fontSize: "0.72rem", padding: "4px 10px" }}
            >
              Clear filters
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

      {/* Breakdown */}
      {filtered.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowBreakdown((v) => !v)}
            className="btn-ghost"
            style={{
              fontSize: "0.72rem",
              padding: "4px 10px",
              marginBottom: "8px",
            }}
          >
            {showBreakdown ? "▾ Hide breakdown" : "▸ Show breakdown"}
          </button>

          {showBreakdown && (
            <div className="flex flex-wrap gap-4">
              {/* By customer */}
              <div
                className="card p-3"
                style={{ minWidth: "200px", flex: "1 1 200px" }}
              >
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: "var(--text-dim)",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                    letterSpacing: "0.05em",
                  }}
                >
                  Hours by customer
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {byCustomer.map(([customer, hours]) => (
                      <tr key={customer}>
                        <td
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-primary)",
                            padding: "3px 0",
                          }}
                        >
                          {customer}
                        </td>
                        <td
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--accent)",
                            fontWeight: 700,
                            textAlign: "right",
                            padding: "3px 0",
                          }}
                        >
                          {hours.toFixed(1)}h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* By code */}
              <div
                className="card p-3"
                style={{ minWidth: "260px", flex: "2 1 260px" }}
              >
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: "var(--text-dim)",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                    letterSpacing: "0.05em",
                  }}
                >
                  Hours by code
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th
                        style={{
                          fontSize: "0.62rem",
                          color: "var(--text-dim)",
                          textAlign: "left",
                          fontWeight: 400,
                          paddingBottom: "4px",
                        }}
                      >
                        Code
                      </th>
                      <th
                        style={{
                          fontSize: "0.62rem",
                          color: "var(--text-dim)",
                          textAlign: "left",
                          fontWeight: 400,
                          paddingBottom: "4px",
                        }}
                      >
                        Customer
                      </th>
                      <th
                        style={{
                          fontSize: "0.62rem",
                          color: "var(--text-dim)",
                          textAlign: "right",
                          fontWeight: 400,
                          paddingBottom: "4px",
                        }}
                      >
                        Hours
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {byCode.map(([code, { hours, customer }]) => (
                      <tr key={code}>
                        <td
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--accent)",
                            padding: "3px 12px 3px 0",
                          }}
                        >
                          {code}
                        </td>
                        <td
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-dim)",
                            padding: "3px 12px 3px 0",
                          }}
                        >
                          {customer}
                        </td>
                        <td
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--accent)",
                            fontWeight: 700,
                            textAlign: "right",
                            padding: "3px 0",
                          }}
                        >
                          {hours.toFixed(1)}h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="terminal-prompt text-xs mb-4">
        entries.list({filter !== "all" ? `billed=${filter === "billed"}` : ""}
        {from ? `, from="${from}"` : ""}
        {to ? `, to="${to}"` : ""}
        {customerFilter ? `, customer="${customerFilter}"` : ""}
        {codeFilter ? `, code="${codeFilter}"` : ""}
        {search ? `, q="${search}"` : ""}) → {filtered.length} results
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
