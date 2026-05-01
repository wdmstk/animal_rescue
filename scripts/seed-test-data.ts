import { loadEnvConfig } from "@next/env";
import { resetSeedData, seedScenario } from "../src/lib/testing/seed-scenarios";

type SeedCommand = "baseline" | "showcase" | "reset" | "clear";

const command = (process.argv[2] ?? "baseline") as SeedCommand;

const isValidCommand = (value: string): value is SeedCommand =>
  value === "baseline" || value === "showcase" || value === "reset" || value === "clear";

const run = async (): Promise<void> => {
  loadEnvConfig(process.cwd());

  if (!isValidCommand(command)) {
    throw new Error(`Unsupported command: ${command}. Use baseline | showcase | reset | clear.`);
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }

  const { prisma } = await import("../src/lib/prisma");

  try {
    if (command === "reset") {
      await resetSeedData(prisma);
      const result = await seedScenario(prisma, "baseline");
      console.log(`Seed reset complete (baseline reloaded): households=${result.householdCount}, pets=${result.petCount}`);
      return;
    }

    if (command === "clear") {
      const result = await resetSeedData(prisma);
      console.log(`Seed data cleared: households=${result.householdIds.length}, pets=${result.petIds.length}`);
      return;
    }

    await resetSeedData(prisma);
    const result = await seedScenario(prisma, command);
    console.log(`Seed scenario '${command}' applied: households=${result.householdCount}, pets=${result.petCount}`);
  } finally {
    await prisma.$disconnect();
  }
};

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[seed-test-data] ${message}`);
  process.exitCode = 1;
});
