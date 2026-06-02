// Created: 2025-01-28
// v2.1 - Add billing rate stat: billable (non-COMP) hours / total hours this week
// v2.2 - Wire updateNote to TimeEntryList
// v2.3 - Add expandable current-week daily view and previous-week summary row
// v2.4 - Fix terminal-prompt spacing (mb-4) and change date format to dd.MM.yy
// Purpose: Dashboard page. Shows the time entry form and today's entries,
//          plus summary stats: hours logged today, hours this week, and weekly billing rate.

"use client";

import { useMemo, useState } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  subWeeks,
  eachDayOfInterval,
} from "date-fns";
import TimeEntryForm from "../../../components/TimeEntryForm";
import TimeEntryList from "../../../components/TimeEntryList";
import { useEntries } from "../../../hooks/useEntries";
import { useCodes } from "../../../hooks/useCodes";

export default function DashboardPage() {
  const { entries, loading, addEntry, deleteEntry, toggleBilled, updateNote } =
    useEntries();
  const { codes } = useCodes();

  const today = format(new Date(), "yyyy-MM-dd");
  const weekStart = format(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
    "yyyy-MM-dd",
  );
  const prevWeekStartDate = startOfWeek(subWeeks(new Date(), 1), {
    weekStartsOn: 1,
  });
  const prevWeekEndDate = endOfWeek(subWeeks(new Date(), 1), {
    weekStartsOn: 1,
  });
  const prevWeekStart = format(prevWeekStartDate, "yyyy-MM-dd");
  const prevWeekEnd = format(prevWeekEndDate, "yyyy-MM-dd");

  const currentWeekDays = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(new Date(), { weekStartsOn: 1 }),
        end: endOfWeek(new Date(), { weekStartsOn: 1 }),
      }),
    [weekStart],
  );

  const [expandedDays, setExpandedDays] = useState<Set<string>>(
    () => new Set([today]),
  );
  const [prevWeekExpanded, setPrevWeekExpanded] = useState(false);

  function toggleDay(dateStr: string) {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dateStr)) {
        next.delete(dateStr);
      } else {
        next.add(dateStr);
      }
      return next;
    });
  }

  const todayEntries = useMemo(
    () => entries.filter((e) => e.date === today),
    [entries, today],
  );

  const hoursToday = useMemo(
    () => todayEntries.reduce((sum, e) => sum + e.hours, 0),
    [todayEntries],
  );

  const hoursWeek = useMemo(
    () =>
      entries
        .filter((e) => e.date >= weekStart)
        .reduce((sum, e) => sum + e.hours, 0),
    [entries, weekStart],
  );

  const billingRateWeek = useMemo(() => {
    if (hoursWeek === 0) return null;
    const billable = entries
      .filter((e) => e.date >= weekStart && e.wbsWo !== "COMP")
      .reduce((sum, e) => sum + e.hours, 0);
    return Math.round((billable / hoursWeek) * 100);
  }, [entries, weekStart, hoursWeek]);

  const entriesByDay = useMemo(() => {
    const map: Record<string, typeof entries> = {};
    for (const day of currentWeekDays) {
      const key = format(day, "yyyy-MM-dd");
      map[key] = entries.filter((e) => e.date === key);
    }
    return map;
  }, [entries, currentWeekDays]);

  const prevWeekEntries = useMemo(
    () =>
      entries.filter((e) => e.date >= prevWeekStart && e.date <= prevWeekEnd),
    [entries, prevWeekStart, prevWeekEnd],
  );

  const prevWeekHours = useMemo(
    () => prevWeekEntries.reduce((sum, e) => sum + e.hours, 0),
    [prevWeekEntries],
  );

  return (
    <div className="py-4">
      <div className="flex items-center gap-4 mb-6">
        <h1
          style={{
            color: "var(--accent)",
            fontSize: "1.1rem",
            fontWeight: 700,
          }}
        >
          <span className="text-dim">~/</span>dashboard
        </h1>
        <div className="flex gap-4 ml-auto">
          <div className="card px-4 py-2 text-center">
            <div
              style={{
                fontSize: "1.4rem",
                fontWeight: 700,
                color: "var(--accent)",
              }}
            >
              {hoursToday.toFixed(1)}
            </div>
            <div
              style={{
                fontSize: "0.65rem",
                color: "var(--text-dim)",
                textTransform: "uppercase",
              }}
            >
              hours today
            </div>
          </div>
          <div className="card px-4 py-2 text-center">
            <div
              style={{
                fontSize: "1.4rem",
                fontWeight: 700,
                color: "var(--accent)",
              }}
            >
              {hoursWeek.toFixed(1)}
            </div>
            <div
              style={{
                fontSize: "0.65rem",
                color: "var(--text-dim)",
                textTransform: "uppercase",
              }}
            >
              hours this week
            </div>
          </div>
          <div className="card px-4 py-2 text-center">
            <div
              style={{
                fontSize: "1.4rem",
                fontWeight: 700,
                color:
                  billingRateWeek !== null && billingRateWeek < 50
                    ? "var(--danger)"
                    : "var(--accent)",
              }}
            >
              {billingRateWeek !== null ? `${billingRateWeek}%` : "—"}
            </div>
            <div
              style={{
                fontSize: "0.65rem",
                color: "var(--text-dim)",
                textTransform: "uppercase",
              }}
            >
              billing rate
            </div>
          </div>
        </div>
      </div>

      <TimeEntryForm codes={codes} onAdd={addEntry} />

      <div className="mt-8">
        {/* Current Week */}
        <div className="terminal-prompt text-xs mb-4">week.current()</div>
        <div className="flex flex-col gap-1 mb-6">
          {currentWeekDays.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayEntries = entriesByDay[dateStr] ?? [];
            const dayHours = dayEntries.reduce((sum, e) => sum + e.hours, 0);
            const isExpanded = expandedDays.has(dateStr);
            const isToday = dateStr === today;

            return (
              <div
                key={dateStr}
                className="card"
                style={{ overflow: "hidden" }}
              >
                <button
                  onClick={() => toggleDay(dateStr)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "8px 12px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      color: "var(--text-dim)",
                      fontSize: "0.7rem",
                      minWidth: "2rem",
                    }}
                  >
                    {format(day, "EEE")}
                  </span>
                  <span
                    style={{
                      fontWeight: isToday ? 700 : 400,
                      color: isToday ? "var(--accent)" : "var(--text-primary)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {format(day, "d MMM")}
                  </span>
                  {isToday && (
                    <span
                      style={{
                        fontSize: "0.6rem",
                        color: "var(--accent)",
                        textTransform: "uppercase",
                        border: "1px solid var(--accent)",
                        padding: "1px 4px",
                        borderRadius: "2px",
                      }}
                    >
                      today
                    </span>
                  )}
                  <span
                    style={{
                      marginLeft: "auto",
                      color: "var(--accent)",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                    }}
                  >
                    {dayHours > 0 ? `${dayHours.toFixed(1)}h` : "—"}
                  </span>
                  <span
                    style={{ color: "var(--text-dim)", fontSize: "0.72rem" }}
                  >
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </button>
                {isExpanded && (
                  <div style={{ borderTop: "1px solid var(--border)" }}>
                    {dayEntries.length === 0 ? (
                      <p
                        style={{
                          color: "var(--text-dim)",
                          fontSize: "0.8rem",
                          padding: "8px 12px",
                        }}
                      >
                        No entries.
                      </p>
                    ) : (
                      <TimeEntryList
                        entries={dayEntries}
                        onDelete={deleteEntry}
                        onToggleBilled={toggleBilled}
                        onUpdateNote={updateNote}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Previous Week */}
        <div className="terminal-prompt text-xs mb-4">week.previous()</div>
        <div className="card" style={{ overflow: "hidden" }}>
          <button
            onClick={() => setPrevWeekExpanded((v) => !v)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "8px 12px",
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span style={{ color: "var(--text-dim)", fontSize: "0.7rem" }}>
              {format(prevWeekStartDate, "d MMM")} –{" "}
              {format(prevWeekEndDate, "d MMM")}
            </span>
            <span
              style={{
                marginLeft: "auto",
                color: "var(--accent)",
                fontWeight: 600,
                fontSize: "0.85rem",
              }}
            >
              {prevWeekHours > 0 ? `${prevWeekHours.toFixed(1)}h` : "—"}
            </span>
            <span style={{ color: "var(--text-dim)", fontSize: "0.72rem" }}>
              {prevWeekEntries.length} entr
              {prevWeekEntries.length === 1 ? "y" : "ies"}
            </span>
            <span style={{ color: "var(--text-dim)", fontSize: "0.72rem" }}>
              {prevWeekExpanded ? "▲" : "▼"}
            </span>
          </button>
          {prevWeekExpanded && (
            <div style={{ borderTop: "1px solid var(--border)" }}>
              {prevWeekEntries.length === 0 ? (
                <p
                  style={{
                    color: "var(--text-dim)",
                    fontSize: "0.8rem",
                    padding: "8px 12px",
                  }}
                >
                  No entries last week.
                </p>
              ) : (
                <TimeEntryList
                  entries={prevWeekEntries}
                  onDelete={deleteEntry}
                  onToggleBilled={toggleBilled}
                  onUpdateNote={updateNote}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
