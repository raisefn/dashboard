import { NextResponse } from "next/server";

export const runtime = "nodejs";

const IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // Anthropic's per-image limit

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const name = file.name;
    const lower = name.toLowerCase();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Image branch — return base64 + media_type so the chat can attach it as
    // a multimodal content block when calling the brain.
    if (IMAGE_MIME_TYPES.includes(file.type) || /\.(png|jpe?g|webp|gif)$/i.test(lower)) {
      if (buffer.length > MAX_IMAGE_BYTES) {
        return NextResponse.json(
          { error: `Image too large (${(buffer.length / 1024 / 1024).toFixed(1)}MB). Limit is 5MB.` },
          { status: 400 }
        );
      }
      const mediaType = IMAGE_MIME_TYPES.includes(file.type)
        ? file.type
        : lower.endsWith(".png")
          ? "image/png"
          : lower.endsWith(".webp")
            ? "image/webp"
            : lower.endsWith(".gif")
              ? "image/gif"
              : "image/jpeg";
      return NextResponse.json({
        kind: "image",
        filename: name,
        media_type: mediaType,
        data: buffer.toString("base64"),
        bytes: buffer.length,
      });
    }

    // Document branch — extract text. Existing behavior.
    let text = "";

    if (lower.endsWith(".pdf")) {
      const { extractText } = await import("unpdf");
      const result = await extractText(new Uint8Array(bytes));
      text = Array.isArray(result.text) ? result.text.join("\n") : result.text;
    } else if (lower.endsWith(".txt") || lower.endsWith(".md")) {
      text = buffer.toString("utf-8");
    } else if (lower.endsWith(".docx")) {
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(buffer);
      const docXml = await zip.file("word/document.xml")?.async("string");
      if (docXml) {
        text = docXml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      }
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Upload a PDF, DOCX, TXT, MD file, or image (PNG/JPG/WEBP/GIF)." },
        { status: 400 }
      );
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from file." },
        { status: 400 }
      );
    }

    const truncated = text.slice(0, 50000);

    return NextResponse.json({
      kind: "text",
      filename: name,
      text: truncated,
      chars: truncated.length,
      truncated: text.length > 50000,
    });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: "Failed to process file." }, { status: 500 });
  }
}
