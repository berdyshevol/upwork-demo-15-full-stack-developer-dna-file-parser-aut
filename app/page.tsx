import UploadCard from "./_components/UploadCard";

export default function Home() {
  return (
    <div className="grid gap-10">
      <section className="grid gap-3">
        <h1 className="text-3xl font-bold text-brand-900 tracking-tight">
          DNA Insights — a 4-pillar performance report from your raw DNA
        </h1>
        <p className="text-ink-700 max-w-2xl">
          Upload the file you already downloaded from 23andMe or AncestryDNA. We parse a
          curated set of well-studied SNPs (BDNF, COMT, MTHFR, APOE, DRD2), score four
          lifestyle pillars, and email you a branded PDF — usually in under 30 seconds.
        </p>
      </section>
      <UploadCard />
    </div>
  );
}
