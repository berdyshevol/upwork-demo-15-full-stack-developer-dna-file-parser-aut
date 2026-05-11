import { NextResponse } from "next/server";
import { getReport } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const report = getReport(id);
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }
  return new NextResponse(new Uint8Array(report.pdfBuffer), {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="dna-insights-${id}.pdf"`,
      "cache-control": "no-store",
    },
  });
}
