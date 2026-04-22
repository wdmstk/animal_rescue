import { defineConfig, devices } from "@playwright/test";

const envPrefix =
  "DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres " +
  "NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321 " +
  "NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy " +
  "SUPABASE_SERVICE_ROLE_KEY=dummy " +
  "NEXT_PUBLIC_APP_URL=http://127.0.0.1:3000";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:3000"
  },
  webServer: {
    command: `${envPrefix} npm run dev`,
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 120000
  },
  projects: [
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 7"] }
    }
  ]
});
