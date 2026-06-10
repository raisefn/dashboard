// Shared copy for the limit_reached upgrade wall card. Used by:
//   - app/brain/deploy/page.tsx (real wall card in chat, via innerHTML)
//   - app/brain/deploy/preview-wall/page.tsx (static design preview)
// Centralizing here means soft-tone copy edits land in one place.

export type WallCardReason = "messages" | "briefs" | "matches" | "monthly" | "daily" | "hourly" | "lifetime";

export function wallCardLeadin(reason: string | null | undefined): string {
  if (reason === "briefs") {
    return "You've reached the brief limit on free. To keep building briefs, pick a path:";
  }
  if (reason === "matches") {
    return "You've reached the matches limit on free. To keep matching, pick a path:";
  }
  // messages — covers monthly/daily/hourly/lifetime/anything else
  return "You've reached the chat limit on free. To keep going, pick a path:";
}
