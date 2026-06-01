// Created: 2025-01-28
// v2.0 - Initial creation
// Purpose: Custom React hook for managing WBS/WO codes in Firestore.
//          Provides codes array, loading state, addCode, and deleteCode functions.

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  fetchCodes,
  addCode as firestoreAddCode,
  deleteCode as firestoreDeleteCode,
} from "../lib/firestore";
import type { Code } from "../types";

export function useCodes() {
  const { user } = useAuth();
  const [codes, setCodes] = useState<Code[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchCodes(user.uid)
      .then((data) => setCodes(data))
      .finally(() => setLoading(false));
  }, [user]);

  async function addCode(data: Omit<Code, "id">) {
    if (!user) return;
    const docRef = await firestoreAddCode(user.uid, data);
    const id = docRef.id;
    setCodes((prev) => [...prev, { ...data, id }]);
  }

  async function deleteCode(id: string) {
    if (!user) return;
    await firestoreDeleteCode(user.uid, id);
    setCodes((prev) => prev.filter((c) => c.id !== id));
  }

  return { codes, loading, addCode, deleteCode };
}
