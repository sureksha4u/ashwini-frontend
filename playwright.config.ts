import { defineConfig, devices } from "@playwright/test";

// Port + base URL are configurable so this config plays nicely with whatever
// dev server is already running locally. Defaults match the dev port we use
// in the rest of the repo's verifier scripts.
// Default to 3000 because that's `next dev`'s default and matches the
// CORS allowlist on the backend. Override with PLAYWRIGHT_PORT if needed.
const PORT = process.env.PLAYWRIGHT_PORT
  ? Number(process.env.PLAYWRIGHT_PORT)
  : 3000;
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  // Vitest accidentally picks up these specs otherwise.
  testMatch: /\.spec\.ts$/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
