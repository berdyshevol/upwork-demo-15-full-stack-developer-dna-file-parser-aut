export type Pillar = "focus" | "mood" | "stress" | "recovery";

export interface ContentEntry {
  rsid: string;
  gene: string;
  pillar: Pillar;
  /** Genotypes (unordered alleles, sorted) that mark the "risk" / minor-allele profile. */
  riskGenotypes: string[];
  optimalCopy: string;
  riskCopy: string;
}

export const DEMO_SNPS: ContentEntry[] = [
  {
    rsid: "rs6265",
    gene: "BDNF",
    pillar: "focus",
    riskGenotypes: ["CT", "TT"],
    optimalCopy:
      "BDNF (Val/Val): robust neurotrophic signalling supports faster learning, working memory, and mental endurance.",
    riskCopy:
      "BDNF (Met carrier): consider novelty-rich learning, aerobic exercise, and omega-3s to support synaptic plasticity.",
  },
  {
    rsid: "rs4680",
    gene: "COMT",
    pillar: "stress",
    riskGenotypes: ["AA", "AG"],
    optimalCopy:
      "COMT (Val/Val): rapid dopamine clearance — you thrive under pressure but may need more stimulation to focus.",
    riskCopy:
      "COMT (Met carrier): dopamine lingers longer in prefrontal cortex — protect recovery time and minimise high-stress multitasking.",
  },
  {
    rsid: "rs1801133",
    gene: "MTHFR",
    pillar: "mood",
    riskGenotypes: ["CT", "TT"],
    optimalCopy:
      "MTHFR C677C: efficient folate metabolism supports stable neurotransmitter synthesis.",
    riskCopy:
      "MTHFR T variant: reduced folate conversion — methylated B-complex (5-MTHF, methyl-B12) and leafy greens can help mood resilience.",
  },
  {
    rsid: "rs429358",
    gene: "APOE",
    pillar: "recovery",
    riskGenotypes: ["CT", "CC"],
    optimalCopy:
      "APOE non-ε4: standard lipid handling — keep cardio and sleep dialled to maintain neurovascular recovery.",
    riskCopy:
      "APOE ε4 carrier: prioritise sleep, aerobic conditioning, and a mediterranean-style diet to support long-term recovery.",
  },
  {
    rsid: "rs1800497",
    gene: "DRD2",
    pillar: "mood",
    riskGenotypes: ["GA", "AG", "AA"],
    optimalCopy:
      "DRD2 (Taq1A G/G): high striatal D2 density — strong reward learning supports motivation.",
    riskCopy:
      "DRD2 (Taq1A A carrier): fewer D2 receptors — short feedback loops and structured habits help motivation more than willpower.",
  },
];

export const PILLARS: Pillar[] = ["focus", "mood", "stress", "recovery"];

export const PILLAR_LABEL: Record<Pillar, string> = {
  focus: "Focus",
  mood: "Mood",
  stress: "Stress",
  recovery: "Recovery",
};
