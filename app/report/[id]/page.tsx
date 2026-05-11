import { notFound } from "next/navigation";
import Link from "next/link";
import { getReport } from "@/lib/store";
import { PILLAR_LABEL, type Pillar } from "@/lib/content-library";

function Gauge({ score, label }: { score: number; label: string }) {
  const radius = 36;
  const cx = 44;
  const cy = 44;
  const start = Math.PI;
  const end = Math.PI * 2;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const ang = start + (end - start) * pct;
  const x = cx + radius * Math.cos(ang);
  const y = cy + radius * Math.sin(ang);
  const largeArc = pct > 0.5 ? 1 : 0;
  return (
    <svg
      width="88"
      height="56"
      viewBox="0 0 88 56"
      data-testid={`gauge-${label.toLowerCase()}`}
      aria-label={`${label} gauge`}
    >
      <path
        d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
        stroke="#dbf5e7"
        strokeWidth={8}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 ${largeArc} 1 ${x} ${y}`}
        stroke="#10b981"
        strokeWidth={8}
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = getReport(id);
  if (!report) notFound();

  const date = new Date(report.createdAt).toLocaleString();

  return (
    <div className="grid gap-8">
      <section className="rounded-xl border border-brand-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-1">
          <h1 className="text-2xl font-bold text-brand-900">Your report is ready</h1>
          <Link
            href={`/api/report/${report.id}/pdf`}
            target="_blank"
            rel="noopener"
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Download PDF
          </Link>
        </div>
        <p className="text-sm text-ink-500">
          Report{" "}
          <code className="bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded">
            {report.id}
          </code>{" "}
          · Source:{" "}
          <span data-testid="report-vendor" className="font-medium text-ink-700">
            {report.vendor}
          </span>{" "}
          · Generated {date}
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-brand-900 mb-4">
          Your four pillars
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.keys(report.pillarScores) as Pillar[]).map((p) => (
            <div
              key={p}
              data-testid={`pillar-${p}`}
              className="rounded-lg border border-brand-100 bg-white p-4 flex items-center gap-3"
            >
              <Gauge score={report.pillarScores[p]} label={PILLAR_LABEL[p]} />
              <div>
                <div className="text-sm font-semibold text-brand-900">
                  {PILLAR_LABEL[p]}
                </div>
                <div className="text-2xl font-bold text-brand-700 leading-none">
                  {report.pillarScores[p]}
                </div>
                <div className="text-[11px] text-ink-500">out of 100</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section data-testid="content-blocks">
        <h2 className="text-lg font-semibold text-brand-900 mb-4">
          Marker-level insights
        </h2>
        <div className="grid gap-3">
          {report.insights.map((m) => (
            <article
              key={m.rsid}
              className="rounded-lg border border-brand-100 bg-white p-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="font-semibold text-brand-900">
                  {m.gene}{" "}
                  <span className="text-ink-500 font-normal">({m.rsid})</span>{" "}
                  ·{" "}
                  <span className="text-brand-700">{PILLAR_LABEL[m.pillar]}</span>
                </div>
                <div className="text-sm text-ink-700">
                  Your genotype:{" "}
                  <span className="font-mono font-semibold">{m.genotype}</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-ink-700 leading-relaxed">{m.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="text-xs text-ink-500">
        A mock delivery webhook fired at <code>/api/ghl-mock</code> when this report
        was generated (simulating GoHighLevel handoff).
      </section>
    </div>
  );
}
