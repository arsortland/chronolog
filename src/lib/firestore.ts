// Created: 2025-01-28
// v2.0 - Initial creation
// v2.1 - Added updateNote helper for per-entry note updates
// Purpose: Firestore CRUD operations for ChronoLog.
//          Handles time entries (create, read, update, delete, toggle billed)
//          and WBS/WO codes (create, read, delete) under per-user collections.

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Entry, Code } from "../types";

// ─── Entries ────────────────────────────────────────────────────────────────

function entriesRef(userId: string) {
  return collection(db, "users", userId, "entries");
}

export async function addEntry(
  userId: string,
  entry: Omit<Entry, "id" | "createdAt" | "updatedAt">,
) {
  const now = Date.now();
  const data = Object.fromEntries(
    Object.entries({ ...entry, createdAt: now, updatedAt: now }).filter(
      ([, v]) => v !== undefined,
    ),
  );
  return addDoc(entriesRef(userId), data);
}

export async function updateEntry(
  userId: string,
  entryId: string,
  data: Partial<Entry>,
) {
  const ref = doc(db, "users", userId, "entries", entryId);
  return updateDoc(ref, { ...data, updatedAt: Date.now() });
}

export async function deleteEntry(userId: string, entryId: string) {
  const ref = doc(db, "users", userId, "entries", entryId);
  return deleteDoc(ref);
}

export async function fetchEntries(userId: string): Promise<Entry[]> {
  const q = query(
    entriesRef(userId),
    orderBy("date", "desc"),
    orderBy("createdAt", "desc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Entry);
}

export async function toggleBilled(
  userId: string,
  entryId: string,
  billed: boolean,
) {
  return updateEntry(userId, entryId, { billed });
}

export async function updateNote(
  userId: string,
  entryId: string,
  note: string,
) {
  return updateEntry(userId, entryId, { note });
}

// ─── Codes ──────────────────────────────────────────────────────────────────

function codesRef(userId: string) {
  return collection(db, "users", userId, "codes");
}

export async function addCode(userId: string, code: Omit<Code, "id">) {
  return addDoc(codesRef(userId), code);
}

export async function deleteCode(userId: string, codeId: string) {
  const ref = doc(db, "users", userId, "codes", codeId);
  return deleteDoc(ref);
}

export async function fetchCodes(userId: string): Promise<Code[]> {
  const q = query(codesRef(userId), orderBy("customer"), orderBy("code"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Code);
}
