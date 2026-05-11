import { NextResponse } from "next/server";
import { listDeliveries, recordDelivery, clearDeliveries } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { reportId?: string; pdfUrl?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON body" }, { status: 400 });
  }
  if (!body.reportId || !body.pdfUrl) {
    return NextResponse.json(
      { error: "Missing reportId or pdfUrl" },
      { status: 400 },
    );
  }
  recordDelivery({
    reportId: body.reportId,
    pdfUrl: body.pdfUrl,
    timestamp: Date.now(),
  });
  console.log(`[ghl-mock] delivery received: ${body.reportId} → ${body.pdfUrl}`);
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ deliveries: listDeliveries() });
}

export async function DELETE() {
  clearDeliveries();
  return NextResponse.json({ ok: true });
}
