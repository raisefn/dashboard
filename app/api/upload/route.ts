import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const name = file.name.toLowerCase();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let text = "";

    if (name.endsWith(".pdf")) {
      const pdfModule = await import("pdf-parse");
      const pdfParse = (pdfModule as any).default || pdfModule;
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (name.endsWith(".txt") || name.endsWith(".md")) {
      text = buffer.toString("utf-8");
    } else if (name.endsWith(".docx")) {
      // Basic DOCX extraction — pull text from XML
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(buffer);
      const docXml = await zip.file("word/document.xml")?.async("string");
      if (docXml) {
        text = docXml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      }
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Upload PDF, DOCX, TXT, or MD files." },
        { status: 400 }
      );
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from file." },
        { status: 400 }
      );
    }

    // Truncate to ~50K chars to stay within reasonable limits
    const truncated = text.slice(0, 50000);

    return NextResponse.json({
      filename: file.name,
      text: truncated,
      chars: truncated.length,
      truncated: text.length > 50000,
    });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: "Failed to process file." }, { status: 500 });
  }
}
