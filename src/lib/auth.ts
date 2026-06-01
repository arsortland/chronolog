// Created: 2025-01-28
// v2.0 - Initial creation
// v2.1 - Add sendPasswordReset helper
// Purpose: Firebase Auth helper functions for ChronoLog.
//          Provides signIn, signUp, signOut, sendPasswordReset, and auth state subscription.

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User,
} from "firebase/auth";
import { auth } from "./firebase";

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signUp(
  email: string,
  password: string,
  displayName: string,
) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  await updateProfile(credential.user, { displayName });
  return credential;
}

export async function signOut() {
  return firebaseSignOut(auth);
}

export async function sendPasswordReset(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export function subscribeToAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
