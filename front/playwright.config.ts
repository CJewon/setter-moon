import { defineConfig, devices } from "@playwright/test";

const e2ePort = process.env.E2E_PORT ?? "3001";
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${e2ePort}`;
const hasExternalBaseURL = Boolean(process.env.E2E_BASE_URL);
const vercelAutomationBypassSecret =
  process.env.E2E_VERCEL_AUTOMATION_BYPASS_SECRET ?? process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  expect: {
    timeout: 10_000
  },
  use: {
    baseURL,
    extraHTTPHeaders: vercelAutomationBypassSecret
      ? {
          "x-vercel-protection-bypass": vercelAutomationBypassSecret,
          "x-vercel-set-bypass-cookie": "true"
        }
      : undefined,
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "chrome",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        headless: Boolean(process.env.CI)
      }
    }
  ],
  webServer: hasExternalBaseURL
    ? undefined
    : {
        command: `npm run start -- --hostname localhost --port ${e2ePort}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI
      }
});
