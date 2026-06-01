// Created: 2025-01-28
// v2.0 - Initial creation
// Purpose: ThemeToggle button component. Displays a moon/sun icon.
//          Calls useTheme().toggle() to switch between dark and light modes.

"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="btn-icon"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
