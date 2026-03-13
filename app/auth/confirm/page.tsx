"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><p className="text-zinc-400 text-sm">Loading...</p></div>}>
      <AuthConfirmInner />
    </Suspense>
  );
}

function AuthConfirmInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    async function init() {
      const code = searchParams.get("code");

      if (code) {
        // PKCE flow (magic link login)
        const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code);
        if (authError) {
          setError(authError.message);
          return;
        }
        handleSession(data.session?.user);
      } else {
        // Implicit flow (invite link — session already set from hash token)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          handleSession(session.user);
        } else {
          setError("No active session. Please try the invite link again.");
        }
      }
    }

    function handleSession(user: { user_metadata?: Record<string, unknown>; email?: string } | undefined) {
      if (!user) {
        setError("Authentication failed.");
        return;
      }
      const hasSetPassword = user.user_metadata?.password_set;
      if (hasSetPassword) {
        router.replace("/chat");
      } else {
        setUserName((user.user_metadata?.name as string) || user.email?.split("@")[0] || "");
        setShowPasswordSetup(true);
      }
    }

    init();
  }, [searchParams, router]);

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSaving(true);
    setError("");

    const { error: updateError } = await supabase.auth.updateUser({
      password,
      data: { password_set: true },
    });

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    router.replace("/chat");
  }

  if (showPasswordSetup) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-white">
              Welcome{userName ? `, ${userName}` : ""}
            </h1>
            <p className="text-sm text-zinc-500 mt-2">
              Set a password so you can sign in anytime.
            </p>
          </div>

          <form onSubmit={handleSetPassword} className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-teal-700 transition-colors"
                placeholder="At least 8 characters"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Confirm password</label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-teal-700 transition-colors"
                placeholder="Confirm your password"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-full border border-teal-700/50 bg-teal-950/30 py-3 text-sm font-medium text-teal-300 transition-all hover:border-teal-500 hover:bg-teal-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Setting up..." : "Set password & continue"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      {error ? (
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <a href="/login" className="text-sm text-teal-400 hover:underline">
            Back to login
          </a>
        </div>
      ) : (
        <p className="text-zinc-400 text-sm">Signing you in...</p>
      )}
    </div>
  );
}
