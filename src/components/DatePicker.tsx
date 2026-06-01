// Created: 2026-06-01
// v2. - Custom styled date-picker matching the terminal/code-selector aesthetic.
// Purpose: Replaces the native <input type="date"> with a themed calendar dropdown.
//          Shows a styled trigger button with the selected date, then a dropdown
//          calendar (month grid) on click.  Accepts/emits dates as "yyyy-MM-dd"
//          strings.  Closes when clicking outside.

"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  format,
  parse,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
} from "date-fns";

interface DatePickerProps {
  value: string;          // "yyyy-MM-dd"
  onChange: (val: string) => void;
  required?: boolean;
}

const DOW = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export default function DatePicker({ value, onChange, required }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState<Date>(() => {
    if (value) return parse(value, "yyyy-MM-dd", new Date());
    return new Date();
  });
  const ref = useRef<HTMLDivElement>(null);

  // Keep cursor in sync when value changes externally
  useEffect(() => {
    if (value) setCursor(parse(value, "yyyy-MM-dd", new Date()));
  }, [value]);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const selected = value ? parse(value, "yyyy-MM-dd", new Date()) : null;

  // Build the 6-row calendar grid (Mon-first)
  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  function pick(day: Date) {
    onChange(format(day, "yyyy-MM-dd"));
    setOpen(false);
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger button — same pattern as the WBS/WO code selector */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
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
        aria-haspopup="true"
        aria-expanded={open}
      >
        {selected ? (
          <span style={{ color: "var(--text-primary)", fontSize: "0.875rem" }}>
            {format(selected, "dd MMM yyyy")}
          </span>
        ) : (
          <span style={{ color: "var(--text-dim)" }}>— Select date —</span>
        )}
        <span style={{ color: "var(--text-dim)", fontSize: "0.65rem", flexShrink: 0 }}>
          {open ? "▴" : "▾"}
        </span>
      </button>

      {/* Hidden native input keeps form validation / required working */}
      <input
        type="hidden"
        value={value}
        required={required}
      />

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            width: 240,
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            zIndex: 50,
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            padding: "10px 10px 8px",
          }}
        >
          {/* Month navigation */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <button
              type="button"
              onClick={() => setCursor((c) => subMonths(c, 1))}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: "0.75rem",
                padding: "2px 6px",
                borderRadius: 2,
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.color = "var(--accent)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)")
              }
            >
              ◂
            </button>
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--accent)",
                letterSpacing: "0.06em",
                fontWeight: 700,
              }}
            >
              {format(cursor, "MMM yyyy").toUpperCase()}
            </span>
            <button
              type="button"
              onClick={() => setCursor((c) => addMonths(c, 1))}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: "0.75rem",
                padding: "2px 6px",
                borderRadius: 2,
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.color = "var(--accent)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)")
              }
            >
              ▸
            </button>
          </div>

          {/* Day-of-week headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              marginBottom: 4,
            }}
          >
            {DOW.map((d) => (
              <div
                key={d}
                style={{
                  textAlign: "center",
                  fontSize: "0.6rem",
                  color: "var(--text-dim)",
                  letterSpacing: "0.04em",
                  padding: "2px 0",
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
            {days.map((day) => {
              const isSelected = selected ? isSameDay(day, selected) : false;
              const isCurrentMonth = isSameMonth(day, cursor);
              const isTodayDay = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => pick(day)}
                  style={{
                    background: isSelected
                      ? "var(--accent)"
                      : isTodayDay && !isSelected
                      ? "var(--accent-glow)"
                      : "transparent",
                    border: isTodayDay && !isSelected
                      ? "1px solid var(--accent-dim)"
                      : "1px solid transparent",
                    borderRadius: 2,
                    color: isSelected
                      ? "#000"
                      : isCurrentMonth
                      ? "var(--text-primary)"
                      : "var(--text-dim)",
                    cursor: "pointer",
                    fontSize: "0.72rem",
                    fontWeight: isSelected ? 700 : 400,
                    padding: "4px 0",
                    textAlign: "center",
                    opacity: isCurrentMonth ? 1 : 0.35,
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "var(--bg-hover, rgba(0,255,136,0.08))";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        isTodayDay ? "var(--accent-glow)" : "transparent";
                    }
                  }}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>

          {/* "Today" shortcut */}
          <div style={{ marginTop: 8, textAlign: "right" }}>
            <button
              type="button"
              onClick={() => pick(new Date())}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--accent)",
                cursor: "pointer",
                fontSize: "0.65rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                padding: "2px 4px",
              }}
            >
              today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
