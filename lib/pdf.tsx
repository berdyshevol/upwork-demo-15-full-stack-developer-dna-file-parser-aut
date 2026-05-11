import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Circle,
  Path,
  renderToBuffer,
} from "@react-pdf/renderer";
import { PILLAR_LABEL, type Pillar } from "./content-library";
import type { PillarScores, MarkerInsight } from "./pillars";
import type { Vendor } from "./parser";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 11,
    color: "#0b1220",
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  brandBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 12,
    borderBottom: "2pt solid #10b981",
    marginBottom: 18,
  },
  brandMark: {
    width: 28,
    height: 28,
    backgroundColor: "#10b981",
    borderRadius: 6,
    marginRight: 10,
  },
  brandName: { fontSize: 18, fontWeight: 700, color: "#064e3b" },
  brandTag: { fontSize: 9, color: "#6b7280", marginTop: 2 },
  h1: { fontSize: 20, fontWeight: 700, marginBottom: 4, color: "#064e3b" },
  meta: { fontSize: 10, color: "#6b7280", marginBottom: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#064e3b",
    marginTop: 14,
    marginBottom: 8,
  },
  pillarRow: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4 },
  pillarCard: {
    width: "50%",
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  pillarInner: {
    border: "1pt solid #dbf5e7",
    borderRadius: 6,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fbf6",
  },
  pillarLabel: { fontSize: 11, fontWeight: 700, color: "#064e3b" },
  pillarScore: { fontSize: 18, fontWeight: 700, color: "#047857" },
  pillarMeta: { fontSize: 9, color: "#374151", marginTop: 2 },
  markerCard: {
    border: "1pt solid #e5e7eb",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  markerHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  markerGene: { fontSize: 11, fontWeight: 700, color: "#064e3b" },
  markerGenotype: { fontSize: 10, color: "#374151" },
  markerCopy: { fontSize: 10, color: "#374151", lineHeight: 1.4 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    fontSize: 8,
    color: "#6b7280",
    textAlign: "center",
  },
});

function GaugeSvg({ score }: { score: number }) {
  const radius = 22;
  const cx = 28;
  const cy = 28;
  const start = Math.PI;
  const end = Math.PI * 2;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const ang = start + (end - start) * pct;
  const x = cx + radius * Math.cos(ang);
  const y = cy + radius * Math.sin(ang);
  const largeArc = pct > 0.5 ? 1 : 0;
  const bgPath = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`;
  const fgPath = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 ${largeArc} 1 ${x} ${y}`;
  return (
    <Svg width={56} height={34} viewBox="0 0 56 34">
      <Path d={bgPath} stroke="#dbf5e7" strokeWidth={5} fill="none" />
      <Path d={fgPath} stroke="#10b981" strokeWidth={5} fill="none" />
      <Circle cx={cx} cy={cy} r={1.5} fill="#064e3b" />
    </Svg>
  );
}

export interface PdfData {
  reportId: string;
  vendor: Vendor;
  createdAt: number;
  pillarScores: PillarScores;
  insights: MarkerInsight[];
}

export async function renderReportPdf(data: PdfData): Promise<Buffer> {
  const date = new Date(data.createdAt).toISOString().slice(0, 10);
  const doc = (
    <Document title={`DNA Insights Report ${data.reportId}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.brandBar}>
          <View style={styles.brandMark} />
          <View>
            <Text style={styles.brandName}>DNA Insights</Text>
            <Text style={styles.brandTag}>Actionable genomics for everyday performance</Text>
          </View>
        </View>

        <Text style={styles.h1}>Personalised DNA Report</Text>
        <Text style={styles.meta}>
          Report {data.reportId} · Source: {data.vendor} · Generated {date}
        </Text>

        <Text style={styles.sectionTitle}>Your four pillars</Text>
        <View style={styles.pillarRow}>
          {(Object.keys(data.pillarScores) as Pillar[]).map((p) => (
            <View key={p} style={styles.pillarCard}>
              <View style={styles.pillarInner}>
                <GaugeSvg score={data.pillarScores[p]} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.pillarLabel}>{PILLAR_LABEL[p]}</Text>
                  <Text style={styles.pillarScore}>{data.pillarScores[p]}</Text>
                  <Text style={styles.pillarMeta}>out of 100</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Marker-level insights</Text>
        {data.insights.map((m) => (
          <View key={m.rsid} style={styles.markerCard}>
            <View style={styles.markerHead}>
              <Text style={styles.markerGene}>
                {m.gene} ({m.rsid}) · {PILLAR_LABEL[m.pillar]}
              </Text>
              <Text style={styles.markerGenotype}>Your genotype: {m.genotype}</Text>
            </View>
            <Text style={styles.markerCopy}>{m.copy}</Text>
          </View>
        ))}

        <Text style={styles.footer}>
          DNA Insights · For educational use · Not a medical diagnostic. Confirm clinically before acting.
        </Text>
      </Page>
    </Document>
  );
  return await renderToBuffer(doc);
}
