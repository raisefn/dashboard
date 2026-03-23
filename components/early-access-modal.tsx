"use client";

import { useState, useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function EarlyAccessModal({ open, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState<"" | "investor" | "founder" | "builder">("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) {
      setStatus("error");
      setErrorMsg("");
      return;
    }
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, role, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong.");
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-600 hover:text-zinc-400 transition-colors"
          aria-label="Close"
        >
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {status === "success" ? (
          <div className="text-center py-4">
            <h3 className="text-xl font-bold text-white mb-3">Check your email</h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              We sent a verification link to <span className="text-zinc-200">{email}</span>.
              Click it to confirm your spot.
            </p>
            <button
              onClick={onClose}
              className="rounded-full border border-zinc-700 px-6 py-2 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-500 hover:text-white"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-white mb-2">Entrepreneurs change the world!</h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              We&apos;re a small team building a big technology. Tell us a bit more about yourself so we can make sure we can provide you value! Demand is high (awesome problem to have), but we promise to get back to you.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-2">I am a...</label>
                <div className="flex gap-2">
                  {([
                    { value: "founder", label: "Founder" },
                    { value: "investor", label: "Investor" },
                    { value: "builder", label: "Builder" },
                  ] as const).map((opt) => (
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
                <label htmlFor="ea-name" className="block text-xs text-zinc-500 mb-1.5">Name</label>
                <input
                  id="ea-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-teal-700 transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="ea-email" className="block text-xs text-zinc-500 mb-1.5">Email</label>
                <input
                  id="ea-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-teal-700 transition-colors"
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label htmlFor="ea-company" className="block text-xs text-zinc-500 mb-1.5">Company</label>
                <input
                  id="ea-company"
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-teal-700 transition-colors"
                  placeholder="Company name"
                />
              </div>

              <div>
                <label htmlFor="ea-message" className="block text-xs text-zinc-500 mb-1.5">Tell us more</label>
                <textarea
                  id="ea-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-teal-700 transition-colors resize-none"
                  placeholder="What are you working on? What brings you here?"
                />
              </div>

              {status === "error" && errorMsg && (
                <p className="text-sm text-red-400">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full rounded-full border border-orange-700/50 bg-orange-950/30 py-3 text-sm font-medium text-orange-300 transition-all hover:border-orange-500 hover:bg-orange-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "submitting" ? "Submitting..." : "Request Access"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
