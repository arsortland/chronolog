// Created: 2025-01-28
// v2.0 - Initial creation
// v2.1 - Add inline "Forgot password?" flow with reset email + confirmation
// Purpose: Login page for ChronoLog. Email/password sign-in form.
//          Redirects to /dashboard on success, shows inline error on failure.
//          Forgot-password link sends a Firebase reset email and shows confirmation.

"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginPage() {
  const { signIn, sendPasswordReset } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot-password state
  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace("/dashboard");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetSubmit(e: FormEvent) {
    e.preventDefault();
    setResetError("");
    setResetLoading(true);
    try {
      await sendPasswordReset(resetEmail);
      setResetSent(true);
    } catch {
      setResetError("Could not send reset email. Check the address and try again.");
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-accent text-3xl font-bold mb-1">ChronoLog</div>
          <div className="text-muted text-sm">
            time tracking // terminal edition
          </div>
        </div>

        <div className="card-accent p-6">
          <div className="text-muted text-xs mb-5 terminal-prompt">
            {forgotMode ? "auth.resetPassword()" : "auth.signIn()"}
          </div>

          {/* ── Forgot-password panel ── */}
          {forgotMode ? (
            resetSent ? (
              <div className="space-y-4">
                <div className="text-xs border border-accent/30 rounded p-3 bg-accent/5 text-accent">
                  Reset link sent — check your inbox (and spam folder).
                </div>
                <button
                  type="button"
                  onClick={() => { setForgotMode(false); setResetSent(false); setResetEmail(""); }}
                  className="btn-ghost w-full text-xs"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <p className="text-dim text-xs">
                  Enter your account email and we&apos;ll send a password reset link.
                </p>
                <div>
                  <label htmlFor="reset-email">Email</label>
                  <input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="input-field mt-1"
                    placeholder="you@example.com"
                  />
                </div>
                {resetError && (
                  <div className="text-danger text-xs border border-danger/30 rounded p-2 bg-danger/5">
                    {resetError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="btn-primary w-full"
                >
                  {resetLoading ? "Sending..." : "Send Reset Link"}
                </button>
                <button
                  type="button"
                  onClick={() => { setForgotMode(false); setResetError(""); }}
                  className="btn-ghost w-full text-xs"
                >
                  Back to sign in
                </button>
              </form>
            )
          ) : (
            /* ── Normal sign-in panel ── */
            <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field mt-1"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field mt-1"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-danger text-xs border border-danger/30 rounded p-2 bg-danger/5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-dim text-xs mt-4">
            <button
              type="button"
              onClick={() => { setForgotMode(true); setResetEmail(email); setResetError(""); }}
              className="text-accent hover:underline bg-transparent border-none cursor-pointer p-0"
            >
              Forgot password?
            </button>
          </p>

          <p className="text-center text-dim text-xs mt-3">
            No account?{" "}
            <Link href="/register" className="text-accent hover:underline">
              Register
            </Link>
          </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
