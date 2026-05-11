"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Tab = "23andMe" | "AncestryDNA";

const VENDOR_INSTRUCTIONS: Record<Tab, { title: string; steps: string[] }> = {
  "23andMe": {
    title: "Get your 23andMe raw data",
    steps: [
      "Sign in to your 23andMe account at you.23andme.com.",
      "Open the profile menu → Browse Raw Data → Download (top right).",
      "Confirm the security prompt; you'll receive a .zip with a .txt inside.",
      "Unzip and upload the .txt file below (up to 25 MB).",
    ],
  },
  AncestryDNA: {
    title: "Get your AncestryDNA raw data",
    steps: [
      "Sign in to your Ancestry account at ancestry.com/dna.",
      "Open your DNA Settings → Download Raw DNA Data.",
      "Confirm your password and approve the email link.",
      "Open the email and download the .zip, then unzip and upload the .txt file below.",
    ],
  },
};

export default function UploadCard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("23andMe");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("Please choose a .txt or .csv DNA file first.");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Upload failed.");
        setBusy(false);
        return;
      }
      router.push(`/report/${data.reportId}`);
    } catch (err) {
      setError((err as Error).message || "Upload failed.");
      setBusy(false);
    }
  }

  const inst = VENDOR_INSTRUCTIONS[tab];

  return (
    <section className="rounded-xl border border-brand-100 bg-white shadow-sm">
      <div role="tablist" aria-label="Vendor" className="flex border-b border-brand-100">
        {(Object.keys(VENDOR_INSTRUCTIONS) as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-sm font-medium ${
              tab === t
                ? "text-brand-700 border-b-2 border-brand-500 -mb-px"
                : "text-ink-500 hover:text-brand-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8 p-6">
        <div data-testid="vendor-instructions">
          <h2 className="text-base font-semibold text-brand-900 mb-3">{inst.title}</h2>
          <ol className="text-sm text-ink-700 space-y-2 list-decimal pl-5">
            {inst.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </div>

        <form onSubmit={onSubmit} className="grid gap-4 content-start">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-ink-700">
              Upload your raw DNA file (.txt or .csv, up to 25 MB)
            </span>
            <input
              type="file"
              accept=".txt,.csv,text/plain,text/csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-md file:border-0 file:bg-brand-500 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-600"
            />
          </label>
          {error && (
            <div
              data-testid="upload-error"
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {busy ? "Generating report…" : "Generate report"}
          </button>
          <p className="text-xs text-ink-500">
            Your file is processed in-memory and never persisted. No account required.
          </p>
        </form>
      </div>
    </section>
  );
}
