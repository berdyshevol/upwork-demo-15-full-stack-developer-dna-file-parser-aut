import type { Vendor, ParsedMarker } from "./parser";
import type { PillarScores, MarkerInsight } from "./pillars";

export interface Report {
  id: string;
  vendor: Vendor;
  createdAt: number;
  markers: ParsedMarker[];
  insights: MarkerInsight[];
  pillarScores: PillarScores;
  pdfBuffer: Buffer;
}

interface Delivery {
  reportId: string;
  pdfUrl: string;
  timestamp: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __dna_demo_store: {
    reports: Map<string, Report>;
    deliveries: Delivery[];
  } | undefined;
}

const g = globalThis as typeof globalThis & {
  __dna_demo_store?: {
    reports: Map<string, Report>;
    deliveries: Delivery[];
  };
};

if (!g.__dna_demo_store) {
  g.__dna_demo_store = { reports: new Map(), deliveries: [] };
}

const store = g.__dna_demo_store;

export function saveReport(r: Report): void {
  store.reports.set(r.id, r);
}

export function getReport(id: string): Report | undefined {
  return store.reports.get(id);
}

export function recordDelivery(d: Delivery): void {
  store.deliveries.push(d);
}

export function listDeliveries(): Delivery[] {
  return store.deliveries.slice();
}

export function clearDeliveries(): void {
  store.deliveries.length = 0;
}
