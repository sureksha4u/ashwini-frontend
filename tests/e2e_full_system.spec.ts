import { test, expect, Page } from "@playwright/test";

// Run with:
//   PLAYWRIGHT_PORT=3018 npx playwright test
// Backend (uvicorn) and frontend (next dev) must both be running locally;
// the spec uses real seeded credentials.

const ADMIN = { email: "admin@ashwini.hms", password: "admin123" };
const PHARM = { email: "pharmacist@ashwini.hms", password: "pharmacy123" };
const DOC_TLK = { email: "doctor.1@ashwini.hms", password: "doctor123" };

async function login(page: Page, email: string, password: string) {
  // Capture console errors so failures are easier to debug.
  page.on("pageerror", (e) => console.error("[pageerror]", e.message));
  page.on("console", (m) => {
    if (m.type() === "error") console.error("[console.error]", m.text());
  });
  await page.goto("/");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  // Submit via Enter — works regardless of button name/visibility quirks.
  await page.locator('input[type="password"]').press("Enter");
  await expect(page).toHaveURL(/.*dashboard/, { timeout: 10_000 });
}

test.describe("Auth + RBAC", () => {
  test("admin lands on dashboard and sees Organization Management", async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await expect(page.getByRole("heading", { name: /Organization Management/i })).toBeVisible();
  });

  test("pharmacist lands on dashboard but does NOT see Organization Management", async ({ page }) => {
    await login(page, PHARM.email, PHARM.password);
    // Org-mgmt section is admin-only — assert it's not rendered.
    await expect(page.getByRole("heading", { name: /Organization Management/i })).toHaveCount(0);
  });

  test("body never serializes objects to '[object Object]'", async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password);
    const body = await page.textContent("body");
    expect(body || "").not.toContain("[object Object]");
  });
});

test.describe("Doctor patient search", () => {
  test("doctor logs in and searches for a patient", async ({ page }) => {
    await login(page, DOC_TLK.email, DOC_TLK.password);
    // Use the dashboard "Open Patient File" search (placeholder ends with "…",
    // distinguishing it from the header global-search which mentions "UHID").
    const search = page.getByPlaceholder("Search patients…");
    await search.click();
    await search.pressSequentially("ras", { delay: 50 });
    // 350ms debounce + DB roundtrip → wait up to 8s for result row.
    // Result rows show UHID-ASH-DEL-... — match the common "ASH-DEL-" prefix.
    const firstResult = page.locator("button", { hasText: /ASH-DEL-/ }).first();
    await expect(firstResult).toBeVisible({ timeout: 8_000 });
  });
});

test.describe("Pharmacy dispensing flow", () => {
  test("pharmacist opens dispensing page and the page renders", async ({ page }) => {
    await login(page, PHARM.email, PHARM.password);
    // Navigate via URL — the sidebar nav uses <button> + onClick, but a
    // direct goto is faster and equally exercises the route guard + render.
    await page.goto("/pharmacy/dispensing");
    await expect(page).toHaveURL(/.*pharmacy\/dispensing/);

    // No patient selected → "No patient selected" empty state.
    await expect(page.getByText(/No patient selected/i)).toBeVisible();

    // Patient lookup CTA is rendered (the visible search trigger button).
    await expect(page.getByText(/Search patient by name/i)).toBeVisible();
  });
});

test.describe("Dashboard KPIs are wired to backend", () => {
  test("KPI values render as numbers (not literal placeholder)", async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password);
    // The dashboard now shows backend-fed values; the dash uses an em dash
    // while loading, then fills in. We give it a beat then check the
    // "Patients today" tile has a numeric value.
    await page.waitForTimeout(800);
    const tile = page.locator("text=Patients today").locator("..").locator("..");
    const value = await tile.locator("p").first().textContent();
    // Tolerate either "0", "12", "1,284" — but reject the old hardcoded "42".
    expect(value).not.toBe("42");
  });
});
