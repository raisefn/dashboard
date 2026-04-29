// Gmail compose URL helper.
// Builds a URL that opens Gmail's compose window with subject/body/recipient
// prefilled. The user reviews and clicks Send in Gmail's own UI — we never
// send on their behalf.
//
// Gmail caps the URL length at ~8KB (browser-dependent). For longer bodies,
// the caller should fall back to a copy-to-clipboard flow.

export const GMAIL_URL_BODY_LIMIT = 7000;

export function gmailComposeUrl(
  to: string,
  subject: string,
  body: string,
): string {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    su: subject,
    body,
  });
  if (to) {
    params.set("to", to);
  }
  return `https://mail.google.com/mail/?${params.toString()}`;
}

export function bodyExceedsUrlLimit(body: string): boolean {
  return body.length > GMAIL_URL_BODY_LIMIT;
}
