"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import Link from "next/link";

type Role = "founder" | "investor" | "builder";

export default function SignupPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "builder_done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [roleSpecific, setRoleSpecific] = useState("");

  const inputClass =
    "w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-teal-700 transition-colors";

  const btnClass = (selected: boolean) =>
    `w-full text-left rounded-lg border px-3 py-2.5 text-sm transition-all ${
      selected
        ? "border-teal-600 bg-teal-950/40 text-teal-300"
        : "border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400"
    }`;

  const roleOptions: { value: Role; label: string }[] = [
    { value: "founder", label: "Founder" },
    { value: "investor", label: "Investor" },
    { value: "builder", label: "Builder" },
  ];

  const founderOptions = [
    { value: "active", label: "Yes, actively raising" },
    { value: "planning", label: "Planning to in the next 6 months" },
    { value: "exploring", label: "Just exploring" },
  ];

  const investorOptions = [
    { value: "deploying", label: "Yes, actively deploying" },
    { value: "planning", label: "Raising a new fund / planning to deploy" },
    { value: "exploring", label: "Just exploring" },
  ];

  const builderOptions = [
    { value: "sdk", label: "Building on the SDK / API" },
    { value: "opportunities", label: "Looking for startup opportunities" },
    { value: "advising", label: "Advising or consulting" },
    { value: "curious", label: "Just curious" },
  ];

  const roleSpecificOptions =
    role === "founder" ? founderOptions :
    role === "investor" ? investorOptions :
    role === "builder" ? builderOptions : [];

  const roleSpecificLabel =
    role === "founder" ? "Are you raising?" :
    role === "investor" ? "Are you actively deploying?" :
    role === "builder" ? "What are you looking for?" : "";

  // Builder flow: no account creation, just capture data
  const isBuilder = role === "builder";
  const needsPassword = !isBuilder;
  const companyRequired = !isBuilder;

  function canSubmit() {
    if (!role || !roleSpecific) return false;
    if (!name.trim() || !email.trim()) return false;
    if (needsPassword && password.length < 6) return false;
    if (companyRequired && !company.trim()) return false;
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit()) return;
    if (needsPassword && password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setErrorMsg("");

    if (isBuilder) {
      // Builder: just notify Slack, no Supabase account
      fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          company: company.trim() || "—",
          role: "builder",
          raising_status: roleSpecific,
          phone: phone.trim() || "—",
        }),
      }).catch(() => {});

      setStatus("builder_done");
      return;
    }

    // Founder / Investor: create Supabase account
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          name: name.trim(),
          company: company.trim(),
          role,
          raising_status: roleSpecific,
          phone: phone.trim() || null,
        },
      },
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    // Slack notification
    fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company: company.trim(),
        role,
        raising_status: roleSpecific,
        phone: phone.trim() || "—",
      }),
    }).catch(() => {});

    setStatus("sent");
  }

  function resetForm() {
    setStatus("idle");
    setName("");
    setEmail("");
    setPassword("");
    setCompany("");
    setPhone("");
    setRole("");
    setRoleSpecific("");
    setErrorMsg("");
  }

  // ── Confirmation screens ──

  if (status === "sent") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-md text-center py-8">
          <h3 className="text-2xl font-bold text-white mb-3">Check your email</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            We sent a verification link to <span className="text-zinc-200">{email}</span>.
            Click it to get started.
          </p>
          <button onClick={resetForm} className="mt-6 text-sm text-zinc-600 hover:text-zinc-400 transition-colors">
            Sign up with a different email
          </button>
        </div>
      </div>
    );
  }

  if (status === "builder_done") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-md text-center py-8">
          <h3 className="text-2xl font-bold text-white mb-3">Thanks, {name.split(" ")[0]}!</h3>
          <p className="text-sm text-zinc-400 leading-relaxed mb-4">
            We&apos;re building for founders first, but we&apos;re paying close attention to what builders need.
            We&apos;ll reach out when we&apos;re ready for you.
          </p>
          <p className="text-sm text-zinc-500 mb-6">
            In the meantime, our tracker data is open:
          </p>
          <Link
            href="/tracker"
            className="rounded-full border border-teal-700/50 bg-teal-950/30 px-8 py-3 text-sm font-medium text-teal-300 transition-all hover:border-teal-500 hover:bg-teal-900/30"
          >
            Explore the data
          </Link>
        </div>
      </div>
    );
  }

  // ── Signup form ──

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Get started</h1>
          <p className="text-sm text-zinc-500 mt-2">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selection */}
          <div>
            <label className="block text-xs text-zinc-500 mb-2">I am a...</label>
            <div className="flex gap-2">
              {roleOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setRole(opt.value); setRoleSpecific(""); }}
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
          </div>

          {/* Name */}
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

          {/* Email */}
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

          {/* Password — founders and investors only */}
          {needsPassword && (
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
          )}

          {/* Company — required for founders/investors, optional for builders */}
          <div>
            <label htmlFor="su-company" className="block text-xs text-zinc-500 mb-1.5">
              {isBuilder ? "Company (optional)" : "Company"}
            </label>
            <input
              id="su-company"
              type="text"
              required={companyRequired}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className={inputClass}
              placeholder={isBuilder ? "Company name (if applicable)" : "Company name"}
            />
          </div>

          {/* Phone — optional */}
          <div>
            <label htmlFor="su-phone" className="block text-xs text-zinc-500 mb-1.5">
              Phone (optional)
            </label>
            <input
              id="su-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          {/* Role-specific question — only shows when a role is selected */}
          {role && roleSpecificOptions.length > 0 && (
            <div>
              <label className="block text-xs text-zinc-500 mb-2">{roleSpecificLabel}</label>
              <div className="space-y-2">
                {roleSpecificOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRoleSpecific(opt.value)}
                    className={btnClass(roleSpecific === opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {status === "error" && errorMsg && (
            <p className="text-sm text-red-400">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === "sending" || !canSubmit()}
            className="w-full rounded-full border border-teal-700/50 bg-teal-950/30 py-3 text-sm font-medium text-teal-300 transition-all hover:border-teal-500 hover:bg-teal-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "sending" ? "Creating account..." : isBuilder ? "Submit" : "Create account"}
          </button>

          <p className="text-center text-xs text-zinc-600">
            Already have an account?{" "}
            <Link href="/login" className="text-teal-400 hover:text-teal-300">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
