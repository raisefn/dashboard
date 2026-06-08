"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

/**
 * Unsubscribe landing — target of the link in every raisefn lifecycle
 * email. Reads ?token=<api_key_uuid> from the URL, POSTs it to the brain
 * endpoint, shows confirmation.
 *
 * Token validation lives in brain (validates the UUID + looks up the
 * api_key). This page is just a thin client. No auth required — anyone
 * who has the email link can unsubscribe that account.
 */
export default function UnsubscribePage() {
  return (
    <Suspense fallback={<Status text="Loading…" />}>
      <UnsubscribeInner />
    </Suspense>
  );
}

function UnsubscribeInner() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [message, setMessage] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    // searchParams can be empty briefly during hydration; fall back to
    // window.location.search so we don't fail on the first render.
    const winParams =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : null;
    // Accept `?token=<uuid>` (current format) OR `?api_key=<uuid>`
    // (legacy format from emails sent before Phase D shipped — same UUID,
    // just different param name). Both resolve to the same api_key id.
    const token =
      searchParams.get("token") ||
      winParams?.get("token") ||
      searchParams.get("api_key") ||
      winParams?.get("api_key");

    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState("error");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessage(
        "This unsubscribe link is missing a token. Email team@raisefn.com if you need help."
      );
      return;
    }

    (async () => {
      try {
        const resp = await fetch("/v1/brain/public/email/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (!resp.ok) {
          const data = await resp.json().catch(() => ({}));
          setState("error");
          setMessage(
            data.detail ||
              "Couldn't process this unsubscribe request. Email team@raisefn.com and we'll handle it manually."
          );
          return;
        }
        const data = await resp.json();
        setEmail(data.email || "");
        setState("success");
      } catch {
        setState("error");
        setMessage(
          "Network error. Email team@raisefn.com and we'll unsubscribe you manually."
        );
      }
    })();
  }, [searchParams]);

  if (state === "loading") {
    return <Status text="Unsubscribing…" />;
  }

  if (state === "success") {
    return (
      <Status>
        <h1 className="text-2xl font-bold text-zinc-100 mb-3">
          You&apos;re unsubscribed
        </h1>
        <p className="text-zinc-400 max-w-md mb-2">
          {email
            ? `${email} won't get any more raisefn lifecycle emails.`
            : "You won't get any more raisefn lifecycle emails."}
        </p>
        <p className="text-zinc-500 text-sm max-w-md">
          You&apos;ll still receive account-critical emails if needed
          (e.g., billing, password reset).
        </p>
        <Link
          href="/"
          className="mt-8 text-sm text-teal-400 hover:underline"
        >
          ← back to raisefn
        </Link>
      </Status>
    );
  }

  return (
    <Status>
      <h1 className="text-2xl font-bold text-zinc-100 mb-3">
        Couldn&apos;t unsubscribe
      </h1>
      <p className="text-red-400 max-w-md mb-2">{message}</p>
      <Link
        href="/"
        className="mt-8 text-sm text-teal-400 hover:underline"
      >
        ← back to raisefn
      </Link>
    </Status>
  );
}

function Status({
  text,
  children,
}: {
  text?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="text-center flex flex-col items-center">
        {text && <p className="text-zinc-400 text-sm">{text}</p>}
        {children}
      </div>
    </div>
  );
}
