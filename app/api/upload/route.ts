import { NextResponse } from "next/server";

export const runtime = "nodejs";

const IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // Anthropic's per-image limit
// Document size cap. Decks and pipeline lists comfortably fit under 25MB —
// a 200-page text-heavy PDF is ~5MB; a 25MB PDF is heavily image-stacked
// and would just bloat extraction without adding signal. Server-side cap
// protects us from runaway uploads (memory + extraction time) regardless
// of what Vercel/Next default body limits allow.
const MAX_DOC_BYTES = 25 * 1024 * 1024;

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

    // Document branch — extract text. Enforce size cap before extraction
    // so we don't waste memory + time on runaway uploads.
    if (buffer.length > MAX_DOC_BYTES) {
      return NextResponse.json(
        {
          error:
            `File too large (${(buffer.length / 1024 / 1024).toFixed(1)}MB). ` +
            `Max 25MB. Compress your deck, or paste the text directly into chat.`,
        },
        { status: 400 }
      );
    }

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
    } else if (lower.endsWith(".pptx")) {
      // PowerPoint .pptx is a zip of Open Office XML — slide content lives at
      // ppt/slides/slideN.xml. Same XML-strip approach as .docx, but iterated
      // per slide and labeled so the LLM can reason about deck structure.
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(buffer);
      const slideNames = Object.keys(zip.files)
        .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
        .sort((a, b) => {
          const numA = parseInt(a.match(/slide(\d+)\.xml$/)?.[1] || "0", 10);
          const numB = parseInt(b.match(/slide(\d+)\.xml$/)?.[1] || "0", 10);
          return numA - numB;
        });
      const slideTexts: string[] = [];
      for (let i = 0; i < slideNames.length; i++) {
        const xml = await zip.file(slideNames[i])?.async("string");
        if (xml) {
          const cleaned = xml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
          if (cleaned) slideTexts.push(`Slide ${i + 1}: ${cleaned}`);
        }
      }
      text = slideTexts.join("\n\n");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Upload a PDF, DOCX, PPTX, TXT, MD file, or image (PNG/JPG/WEBP/GIF)." },
        { status: 400 }
      );
    }

    if (!text.trim()) {
      // PDF fallback: image-based or text-as-paths PDFs (Canva/Figma/Keynote
      // exports) produce zero extractable text. Instead of erroring, hand the
      // raw PDF back as a document attachment — brain forwards it to Claude
      // as a document content block, which handles both text and image PDFs
      // via vision. Only PDF: Anthropic's document blocks support PDF only.
      if (lower.endsWith(".pdf")) {
        return NextResponse.json({
          kind: "document",
          filename: name,
          media_type: "application/pdf",
          data: buffer.toString("base64"),
          bytes: buffer.length,
        });
      }
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
