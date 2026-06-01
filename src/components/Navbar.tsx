// Created: 2025-01-28
// v2.0 - Initial creation
// Purpose: Top navigation bar component.
//          Shows app name, nav links (Dashboard, History, Codes),
//          current user email, ThemeToggle, and sign-out button.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/history", label: "History" },
  { href: "/codes", label: "Codes" },
];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  return (
    <nav
      style={{
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border)",
      }}
      className="px-4 py-3 flex items-center gap-4"
    >
      <Link
        href="/dashboard"
        style={{
          color: "var(--accent)",
          fontWeight: 700,
          letterSpacing: "0.05em",
        }}
        className="text-sm shrink-0"
      >
        ChronoLog
      </Link>

      <div className="flex items-center gap-1 flex-1">
        {navLinks.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color: active ? "var(--accent)" : "var(--text-muted)",
                borderBottom: active
                  ? "1px solid var(--accent)"
                  : "1px solid transparent",
                padding: "0.1rem 0.5rem",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span style={{ color: "var(--text-dim)", fontSize: "0.7rem" }}>
          {user?.displayName ?? user?.email}
        </span>
        <ThemeToggle />
        <button
          onClick={() => signOut()}
          className="btn-icon"
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut size={15} />
        </button>
      </div>
    </nav>
  );
}
