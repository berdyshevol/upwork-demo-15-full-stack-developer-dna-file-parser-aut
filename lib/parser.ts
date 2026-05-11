import { DEMO_SNPS } from "./content-library";

export type Vendor = "23andMe" | "AncestryDNA";

export interface ParsedMarker {
  rsid: string;
  genotype: string;
}

export interface ParseResult {
  vendor: Vendor;
  markers: ParsedMarker[];
}

const DEMO_RSIDS = new Set(DEMO_SNPS.map((s) => s.rsid));

function detectVendor(rawHead: string): Vendor | null {
  const head = rawHead.toLowerCase();
  if (head.includes("23andme")) return "23andMe";
  if (head.includes("ancestrydna") || head.includes("ancestry dna")) return "AncestryDNA";
  return null;
}

function normaliseGenotype(g: string): string {
  return g
    .replace(/[^ACGTID0-]/gi, "")
    .toUpperCase()
    .split("")
    .sort()
    .join("");
}

export function parseDnaFile(raw: string): ParseResult {
  const head = raw.slice(0, 4096);
  const vendor = detectVendor(head);
  if (!vendor) {
    throw new ParseError(
      "Could not detect vendor — please upload an unmodified raw DNA file from 23andMe or AncestryDNA.",
    );
  }

  const markers: ParsedMarker[] = [];
  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.startsWith("#")) continue;
    if (line.toLowerCase().startsWith("rsid\t")) continue;
    const cols = line.split(/\t|,/).map((c) => c.trim());
    if (cols.length < 4) continue;
    const rsid = cols[0];
    if (!DEMO_RSIDS.has(rsid)) continue;

    let genotype: string;
    if (vendor === "23andMe") {
      genotype = cols[3];
    } else {
      // AncestryDNA: rsid chrom pos allele1 allele2
      if (cols.length < 5) continue;
      genotype = cols[3] + cols[4];
    }
    const g = normaliseGenotype(genotype);
    if (!g || g.length < 2 || /[^ACGT]/.test(g)) continue;
    markers.push({ rsid, genotype: g });
  }

  if (markers.length === 0) {
    throw new ParseError(
      "No demo SNPs were found in this file. The file may be empty or unsupported.",
    );
  }

  return { vendor, markers };
}

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}
