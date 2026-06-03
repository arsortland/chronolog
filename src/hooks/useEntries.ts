// Created: 2025-01-28
// v2.0 - Initial creation
// v2.1 - Added updateNote function
// v2.2 - Add isMounted guard to prevent state updates after unmount; silence Firestore cancellation errors
// Purpose: Custom React hook for managing time entries in Firestore.
//          Provides entries array, loading state, addEntry, deleteEntry, toggleBilled functions.

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  fetchEntries,
  addEntry as firestoreAddEntry,
  deleteEntry as firestoreDeleteEntry,
  toggleBilled as firestoreToggleBilled,
  updateNote as firestoreUpdateNote,
} from "../lib/firestore";
import type { Entry } from "../types";

export function useEntries() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let isMounted = true;
    fetchEntries(user.uid)
      .then((data) => {
        if (isMounted) setEntries(data);
      })
      .catch((err) => {
        // Firestore emits a "cancelled" rejection when the component unmounts mid-request;
        // silence it here so it doesn't surface as an unhandled promise rejection.
        if (err?.code !== "cancelled")
          console.error("useEntries fetch error:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [user]);

  async function addEntry(data: Omit<Entry, "id" | "createdAt" | "updatedAt">) {
    if (!user) return;
    const docRef = await firestoreAddEntry(user.uid, data);
    const id = docRef.id;
    const now = Date.now();
    setEntries((prev) => [
      ...prev,
      { ...data, id, createdAt: now, updatedAt: now },
    ]);
  }

  async function deleteEntry(id: string) {
    if (!user) return;
    await firestoreDeleteEntry(user.uid, id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  async function toggleBilled(id: string, current: boolean) {
    if (!user) return;
    await firestoreToggleBilled(user.uid, id, !current);
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, billed: !current, updatedAt: Date.now() } : e,
      ),
    );
  }

  async function updateNote(id: string, note: string) {
    if (!user) return;
    await firestoreUpdateNote(user.uid, id, note);
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, note, updatedAt: Date.now() } : e,
      ),
    );
  }

  return { entries, loading, addEntry, deleteEntry, toggleBilled, updateNote };
}
