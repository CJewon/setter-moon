import { defineConfig, devices } from "@playwright/test";

const e2ePort = process.env.E2E_PORT ?? "3001";
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${e2ePort}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "chrome",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        headless: false
      }
    }
  ],
  webServer: {
    command: `npm run start -- --hostname localhost --port ${e2ePort}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI
  }
});
