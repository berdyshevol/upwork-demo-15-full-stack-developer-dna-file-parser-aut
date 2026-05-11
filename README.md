# DNA Insights Demo

## Live demo

https://upwork-demo-15-full-stack-developer-dna-file-parser-8ccpsipbk.vercel.app


End-to-end demo of the **Upload → Parse → Branded PDF** pipeline for a DNA-derived
performance report. Customer drops a raw 23andMe or AncestryDNA file, the server
parses a curated set of well-studied SNPs (BDNF, COMT, MTHFR, APOE, DRD2), scores
four lifestyle pillars (Focus, Mood, Stress, Recovery), and returns a branded PDF.

## What this demonstrates

- Vendor auto-detection from the raw file header (23andMe vs AncestryDNA).
- Streaming-tolerant SNP extraction in pure TypeScript — no Python `snps` library.
- PDF generation in a Vercel-compatible Node serverless function via
  `@react-pdf/renderer` (pure JS, no chromium binary required).
- Per-pillar scoring + matched content blocks from a seeded JSON content library.
- Mock GoHighLevel webhook (`/api/ghl-mock`) that logs the simulated delivery
  payload `{ reportId, pdfUrl }`.

## Routes

- `/` — branded upload page with per-vendor download instructions
- `POST /api/upload` — accepts the raw DNA file (≤25 MB), parses, generates PDF
- `/report/[id]` — report-ready screen + download link
- `GET /api/report/[id]/pdf` — streams the generated PDF
- `POST /api/ghl-mock` — receives the delivery webhook (also `GET` to inspect, `DELETE` to clear)

## Run locally

```bash
pnpm install
pnpm dev           # http://localhost:3000
pnpm test          # Playwright behavioural tests (all 7 PRD acceptance criteria)
pnpm build         # production build
```

Sample DNA files are in `tests/fixtures/` if you want to try the flow without your own raw file.

## Deploy URL

_(populated by parent pipeline after Vercel deploy)_

## Out of scope (for this demo)

Supabase, Railway, real GoHighLevel account, SMS/email, payment, auth,
MyHeritage/FTDNA formats, and the full marker library — see PRD.
