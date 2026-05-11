import { DEMO_SNPS, PILLARS, type Pillar } from "./content-library";
import type { ParsedMarker } from "./parser";

export interface PillarScores {
  focus: number;
  mood: number;
  stress: number;
  recovery: number;
}

export interface MarkerInsight {
  rsid: string;
  gene: string;
  pillar: Pillar;
  genotype: string;
  isRisk: boolean;
  copy: string;
}

export function computeInsights(markers: ParsedMarker[]): MarkerInsight[] {
  const byRsid = new Map(markers.map((m) => [m.rsid, m.genotype]));
  const insights: MarkerInsight[] = [];
  for (const entry of DEMO_SNPS) {
    const genotype = byRsid.get(entry.rsid);
    if (!genotype) continue;
    const normalisedRisks = entry.riskGenotypes.map((g) =>
      g.split("").sort().join(""),
    );
    const isRisk = normalisedRisks.includes(genotype);
    insights.push({
      rsid: entry.rsid,
      gene: entry.gene,
      pillar: entry.pillar,
      genotype,
      isRisk,
      copy: isRisk ? entry.riskCopy : entry.optimalCopy,
    });
  }
  return insights;
}

export function computePillarScores(insights: MarkerInsight[]): PillarScores {
  const scores: PillarScores = { focus: 80, mood: 80, stress: 80, recovery: 80 };
  const byPillar: Record<Pillar, MarkerInsight[]> = {
    focus: [],
    mood: [],
    stress: [],
    recovery: [],
  };
  for (const i of insights) byPillar[i.pillar].push(i);

  for (const pillar of PILLARS) {
    const arr = byPillar[pillar];
    if (arr.length === 0) {
      // No SNPs in this pillar — neutral default
      scores[pillar] = 70;
      continue;
    }
    const riskRatio = arr.filter((i) => i.isRisk).length / arr.length;
    // 95 = all optimal, 50 = all risk
    scores[pillar] = Math.round(95 - riskRatio * 45);
  }
  return scores;
}
