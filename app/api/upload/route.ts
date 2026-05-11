import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { parseDnaFile, ParseError } from "@/lib/parser";
import { computeInsights, computePillarScores } from "@/lib/pillars";
import { renderReportPdf } from "@/lib/pdf";
import { saveReport } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 25 * 1024 * 1024;

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json(
      { error: "The uploaded file is empty — please choose your raw DNA .txt file." },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File is larger than 25 MB.` },
      { status: 400 },
    );
  }

  const raw = await file.text();
  try {
    const parsed = parseDnaFile(raw);
    const insights = computeInsights(parsed.markers);
    const pillarScores = computePillarScores(insights);
    const id = randomUUID().slice(0, 8);
    const createdAt = Date.now();
    const pdfBuffer = await renderReportPdf({
      reportId: id,
      vendor: parsed.vendor,
      createdAt,
      pillarScores,
      insights,
    });
    saveReport({
      id,
      vendor: parsed.vendor,
      createdAt,
      markers: parsed.markers,
      insights,
      pillarScores,
      pdfBuffer,
    });

    const origin = new URL(req.url).origin;
    const pdfUrl = `/api/report/${id}/pdf`;
    // Synchronous mock webhook POST so callers can rely on delivery being logged
    // before they see the success response.
    try {
      await fetch(`${origin}/api/ghl-mock`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reportId: id, pdfUrl }),
      });
    } catch {
      // mock webhook is best-effort
    }

    return NextResponse.json({ reportId: id, vendor: parsed.vendor });
  } catch (err) {
    if (err instanceof ParseError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("upload failed", err);
    return NextResponse.json(
      { error: "Could not generate report from this file." },
      { status: 500 },
    );
  }
}
