/**
 * Inline markdown → HTML for chat content rendering.
 *
 * Used by both the main chat surface (app/brain/deploy/page.tsx) and the
 * agent execution panel (app/brain/deploy/agent-ui.ts) so step result
 * blocks render the same way assistant messages do.
 *
 * Supports: code blocks, inline code, h1-h3, bold (with label/non-label
 * distinction), italic, ordered/unordered lists, hr, links, autolinks,
 * GFM-style tables. Tables are rendered as a borderless grid with the
 * same dark-on-zinc styling as the rest of the chat.
 */
export function formatMarkdown(text: string): string {
  if (!text) return "";
  let t = text;
  // Code blocks first so we don't double-process their content
  t = t.replace(/```(\w*)\n([\s\S]*?)```/g, (_, _lang, code) => {
    const escaped = code.replace(/</g, "&lt;").replace(/>/g, "&gt;").trimEnd();
    return `<pre class="code-block"><code>${escaped}</code></pre>`;
  });
  t = t.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // GFM tables. Detect a header row + separator row + body rows. Renders
  // as a simple HTML table — styling lives in the chat CSS (table.md-table).
  t = t.replace(
    /^(\|.+\|)\s*\n\|[\s\-:|]+\|\s*\n((?:\|.*\|\s*\n?)+)/gm,
    (_match, headerLine: string, bodyBlock: string) => {
      const cells = (line: string): string[] => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
      const headers = cells(headerLine);
      const rows = bodyBlock.trim().split("\n").map(cells);
      const thead = `<thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>`;
      const tbody = `<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>`;
      return `<table class="md-table">${thead}${tbody}</table>`;
    },
  );

  t = t.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  t = t.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  t = t.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Differentiate bold-labels ("Thesis:", "Check:", "Geo:") from bold-names
  // ("GSR Ventures", "Avery Tanaka") so rendered content has visual hierarchy.
  // Label = bold text ending in a colon → muted gray. Anything else → brand teal.
  t = t.replace(/\*\*(.+?)\*\*/g, (_match, content: string) => {
    if (/:\s*$/.test(content)) {
      return `<strong class="label">${content}</strong>`;
    }
    return `<strong>${content}</strong>`;
  });
  t = t.replace(/\*(.+?)\*/g, "<em>$1</em>");

  t = t.replace(/^(\d+)\. (.+)$/gm, '<li class="numbered"><span class="li-num">$1.</span> $2</li>');
  t = t.replace(/^- (.+)$/gm, '<li class="bulleted">$1</li>');
  t = t.replace(/((?:<li class="numbered">[\s\S]*?<\/li>\n?)+)/g, "<ol>$1</ol>");
  t = t.replace(/((?:<li class="bulleted">[\s\S]*?<\/li>\n?)+)/g, "<ul>$1</ul>");
  t = t.replace(/^---$/gm, "<hr>");
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  t = t.replace(/(^|[^"=])(https?:\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
  t = t.replace(/\n/g, "<br>");
  // Clean up <br> bleed around block elements
  t = t.replace(/<br>\s*(<\/?(?:ol|ul|li|pre|h[1-3]|hr|table|thead|tbody|tr|th|td))/g, "$1");
  t = t.replace(/(<\/(?:ol|ul|pre|h[1-3]|hr|table|thead|tbody|tr)>)\s*<br>/g, "$1");
  return t;
}
