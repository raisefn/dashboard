"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import Link from "next/link";

type Role = "founder" | "investor" | "builder";
type RaisingStatus = "active" | "planning" | "exploring";

export default function SignupPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [raisingStatus, setRaisingStatus] = useState<RaisingStatus | "">("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role || !company.trim() || !raisingStatus) return;
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setErrorMsg("");

    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          name: name.trim(),
          company: company.trim(),
          role,
          raising_status: raisingStatus,
        },
      },
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    setStatus("sent");
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-teal-700 transition-colors";

  const roleOptions: { value: Role; label: string }[] = [
    { value: "founder", label: "Founder" },
    { value: "investor", label: "Investor" },
    { value: "builder", label: "Builder" },
  ];

  const raisingOptions: { value: RaisingStatus; label: string }[] = [
    { value: "active", label: "Yes, actively raising" },
    { value: "planning", label: "Planning to in the next 6 months" },
    { value: "exploring", label: "Just exploring" },
  ];

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Get started</h1>
          <p className="text-sm text-zinc-500 mt-2">
            Free raise readiness assessment. No credit card required.
          </p>
        </div>

        {status === "sent" ? (
          <div className="text-center py-8">
            <h3 className="text-xl font-bold text-white mb-3">Check your email</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              We sent a verification link to <span className="text-zinc-200">{email}</span>.
              Click it to get started.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-2">I am a...</label>
              <div className="flex gap-2">
                {roleOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                      role === opt.value
                        ? "border-teal-600 bg-teal-950/40 text-teal-300"
                        : "border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {!role && status === "error" && !errorMsg && (
                <p className="text-sm text-red-400 mt-2">Please select a role.</p>
              )}
            </div>

            <div>
              <label htmlFor="su-name" className="block text-xs text-zinc-500 mb-1.5">Name</label>
              <input
                id="su-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="su-email" className="block text-xs text-zinc-500 mb-1.5">Email</label>
              <input
                id="su-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label htmlFor="su-password" className="block text-xs text-zinc-500 mb-1.5">Password</label>
              <input
                id="su-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label htmlFor="su-company" className="block text-xs text-zinc-500 mb-1.5">Company</label>
              <input
                id="su-company"
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className={inputClass}
                placeholder="Company name"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-2">Are you raising?</label>
              <div className="space-y-2">
                {raisingOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRaisingStatus(opt.value)}
                    className={`w-full text-left rounded-lg border px-3 py-2.5 text-sm transition-all ${
                      raisingStatus === opt.value
                        ? "border-teal-600 bg-teal-950/40 text-teal-300"
                        : "border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {status === "error" && errorMsg && (
              <p className="text-sm text-red-400">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === "sending" || !role || !raisingStatus}
              className="w-full rounded-full border border-teal-700/50 bg-teal-950/30 py-3 text-sm font-medium text-teal-300 transition-all hover:border-teal-500 hover:bg-teal-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "sending" ? "Creating account..." : "Create account"}
            </button>

            <p className="text-center text-xs text-zinc-600">
              Already have an account?{" "}
              <Link href="/login" className="text-teal-400 hover:text-teal-300">
                Log in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
