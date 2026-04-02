const SLACK_WEBHOOKS = {
  earlyAccess: process.env.SLACK_WEBHOOK_EARLY_ACCESS,
  stripePayments: process.env.SLACK_WEBHOOK_STRIPE_PAYMENTS,
};

export async function notifySlack(
  channel: keyof typeof SLACK_WEBHOOKS,
  text: string
) {
  const url = SLACK_WEBHOOKS[channel];
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (e) {
    console.error("Slack notification failed:", e);
  }
}
