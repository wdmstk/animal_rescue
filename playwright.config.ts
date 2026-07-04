import { defineConfig, devices } from "@playwright/test";

const envPrefix =
  "DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres " +
  "NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321 " +
  "NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy " +
  "SUPABASE_SERVICE_ROLE_KEY=dummy " +
  "STRIPE_SECRET_KEY=sk_test_dummy " +
  "STRIPE_WEBHOOK_SECRET=whsec_dummy " +
  "STRIPE_PRICE_ID_MONTHLY_500=price_dummy " +
  "PLAYWRIGHT_E2E=1 " +
  "E2E_TEST_MODE=true " +
  "NEXT_PUBLIC_APP_URL=http://localhost:3100";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30000,
  use: {
    baseURL: "http://localhost:3100"
  },
  webServer: {
    command: `${envPrefix} npm run dev -- -p 3100`,
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 120000
  },
  projects: [
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 7"] }
    }
  ]
});
