import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DNA Insights — Personalised reports from your raw DNA file",
  description:
    "Upload your 23andMe or AncestryDNA raw file and get a branded PDF with four lifestyle pillars and actionable marker-level insights.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-brand-100 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-brand-500" aria-hidden />
            <div>
              <div className="text-lg font-bold text-brand-900 leading-tight">
                DNA Insights
              </div>
              <div className="text-[11px] text-ink-500 -mt-0.5">
                Actionable genomics for everyday performance
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
        <footer className="mx-auto max-w-5xl px-6 py-10 text-xs text-ink-500">
          For educational use only. Not a medical diagnostic.
        </footer>
      </body>
    </html>
  );
}
