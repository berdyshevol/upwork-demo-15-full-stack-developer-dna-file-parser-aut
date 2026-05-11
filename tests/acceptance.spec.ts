import { test, expect, request as pwRequest } from "@playwright/test";
import path from "node:path";
import fs from "node:fs/promises";

const FIX = (name: string) => path.join(__dirname, "fixtures", name);

test.describe("DNA Report Demo — acceptance", () => {
  test("home page is branded and exposes per-vendor download instructions in tabs (23andMe, AncestryDNA)", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /DNA Insights/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /23andMe/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /AncestryDNA/i })).toBeVisible();
    // Default tab shows 23andMe instructions
    await expect(page.getByTestId("vendor-instructions")).toContainText(/23andMe/i);
    await page.getByRole("tab", { name: /AncestryDNA/i }).click();
    await expect(page.getByTestId("vendor-instructions")).toContainText(/Ancestry/i);
  });

  test("uploading a real 23andMe raw file returns a branded PDF within 30s, vendor auto-detected", async ({ page }) => {
    await page.goto("/");
    await page.setInputFiles('input[type="file"]', FIX("23andme-sample.txt"));
    await page.getByRole("button", { name: /Generate report/i }).click();
    await page.waitForURL(/\/report\/[a-z0-9-]+/i, { timeout: 30_000 });
    await expect(page.getByTestId("report-vendor")).toContainText(/23andMe/i);
    await expect(page.getByRole("link", { name: /Download PDF/i })).toBeVisible();
  });

  test("PDF endpoint streams a valid application/pdf with customer-derived genotypes referenced", async ({ page, request }) => {
    await page.goto("/");
    await page.setInputFiles('input[type="file"]', FIX("23andme-sample.txt"));
    await page.getByRole("button", { name: /Generate report/i }).click();
    await page.waitForURL(/\/report\/[a-z0-9-]+/i, { timeout: 30_000 });
    const url = page.url();
    const reportId = url.split("/report/")[1];
    const res = await request.get(`/api/report/${reportId}/pdf`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/application\/pdf/);
    const buf = await res.body();
    expect(buf.byteLength).toBeGreaterThan(1500);
    // PDF magic header
    expect(buf.subarray(0, 4).toString("utf8")).toBe("%PDF");
  });

  test("report page surfaces 4 pillar gauges and matching content blocks from the library", async ({ page }) => {
    await page.goto("/");
    await page.setInputFiles('input[type="file"]', FIX("23andme-sample.txt"));
    await page.getByRole("button", { name: /Generate report/i }).click();
    await page.waitForURL(/\/report\/[a-z0-9-]+/i, { timeout: 30_000 });
    for (const pillar of ["Focus", "Mood", "Stress", "Recovery"]) {
      await expect(page.getByTestId(`pillar-${pillar.toLowerCase()}`)).toBeVisible();
    }
    // SVG gauge per pillar
    await expect(page.locator('[data-testid^="gauge-"]')).toHaveCount(4);
    // At least one content block sourced from the library
    await expect(page.getByTestId("content-blocks")).toContainText(/BDNF|COMT|MTHFR|APOE|DRD2/);
  });

  test("uploading an AncestryDNA file produces an equivalent PDF with vendor auto-detected", async ({ page, request }) => {
    await page.goto("/");
    await page.setInputFiles('input[type="file"]', FIX("ancestry-sample.txt"));
    await page.getByRole("button", { name: /Generate report/i }).click();
    await page.waitForURL(/\/report\/[a-z0-9-]+/i, { timeout: 30_000 });
    await expect(page.getByTestId("report-vendor")).toContainText(/AncestryDNA/i);
    const reportId = page.url().split("/report/")[1];
    const res = await request.get(`/api/report/${reportId}/pdf`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/application\/pdf/);
    expect((await res.body()).subarray(0, 4).toString("utf8")).toBe("%PDF");
  });

  test("invalid / empty files return a clear error, not a crash", async ({ page }) => {
    await page.goto("/");
    await page.setInputFiles('input[type="file"]', FIX("invalid.txt"));
    await page.getByRole("button", { name: /Generate report/i }).click();
    await expect(page.getByTestId("upload-error")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("upload-error")).toContainText(/could not detect|invalid|no SNPs|unsupported/i);
  });

  test("/api/ghl-mock receives a POST containing { reportId, pdfUrl } on every successful generation", async ({ page, request, baseURL }) => {
    // Clear log first
    await request.delete("/api/ghl-mock");
    await page.goto("/");
    await page.setInputFiles('input[type="file"]', FIX("23andme-sample.txt"));
    await page.getByRole("button", { name: /Generate report/i }).click();
    await page.waitForURL(/\/report\/[a-z0-9-]+/i, { timeout: 30_000 });
    const reportId = page.url().split("/report/")[1];

    const log = await request.get("/api/ghl-mock");
    expect(log.status()).toBe(200);
    const body = await log.json();
    expect(Array.isArray(body.deliveries)).toBe(true);
    expect(body.deliveries.length).toBeGreaterThanOrEqual(1);
    const last = body.deliveries[body.deliveries.length - 1];
    expect(last.reportId).toBe(reportId);
    expect(typeof last.pdfUrl).toBe("string");
    expect(last.pdfUrl).toMatch(/\/api\/report\/.+\/pdf$/);
  });
});
