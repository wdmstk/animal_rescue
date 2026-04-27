import { afterAll, beforeAll, describe, expect, it } from "vitest";

const shouldRunDbIntegration = process.env.RUN_DB_INTEGRATION === "1" && Boolean(process.env.DATABASE_URL);
const describeDb = shouldRunDbIntegration ? describe : describe.skip;

describeDb("schema + rls (real database)", () => {
  let prisma: (typeof import("@/lib/prisma"))["prisma"];

  beforeAll(async () => {
    const prismaModule = await import("@/lib/prisma");
    prisma = prismaModule.prisma;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("has expected emergency pass tables in public schema", async () => {
    const rows = await prisma.$queryRaw<Array<{ table_name: string }>>`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
        and table_name in (
          'Household',
          'HouseholdMember',
          'HouseholdInviteCode',
          'Pet',
          'PetPhoto',
          'PetEmergencyInfo',
          'PetMedicalRecord',
          'PetMedication',
          'PetVaccination',
          'PetEmergencyToken',
          'PetCoreMetricEntry',
          'PetLabResultEntry',
          'PetHealthExtensionEntry'
        )
    `;

    const tableNames = new Set(rows.map((row) => row.table_name));
    expect(tableNames).toEqual(
      new Set([
        "Household",
        "HouseholdMember",
        "HouseholdInviteCode",
        "Pet",
        "PetPhoto",
        "PetEmergencyInfo",
        "PetMedicalRecord",
        "PetMedication",
        "PetVaccination",
        "PetEmergencyToken",
        "PetCoreMetricEntry",
        "PetLabResultEntry",
        "PetHealthExtensionEntry"
      ])
    );
  });

  it("enables rls on household boundary and health tables", async () => {
    const rows = await prisma.$queryRaw<Array<{ tablename: string }>>`
      select c.relname as tablename
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname in (
          'Household',
          'HouseholdMember',
          'HouseholdInviteCode',
          'Pet',
          'PetPhoto',
          'PetEmergencyInfo',
          'PetMedicalRecord',
          'PetMedication',
          'PetVaccination',
          'PetEmergencyToken',
          'PetCoreMetricEntry',
          'PetLabResultEntry',
          'PetHealthExtensionEntry'
        )
        and c.relrowsecurity = true
    `;

    expect(rows.map((row) => row.tablename).sort()).toEqual(
      [
        "Household",
        "HouseholdInviteCode",
        "HouseholdMember",
        "Pet",
        "PetCoreMetricEntry",
        "PetEmergencyInfo",
        "PetEmergencyToken",
        "PetHealthExtensionEntry",
        "PetLabResultEntry",
        "PetMedicalRecord",
        "PetMedication",
        "PetPhoto",
        "PetVaccination"
      ].sort()
    );
  });

  it("defines household member helper and required baseline rls policies", async () => {
    const helperRows = await prisma.$queryRaw<Array<{ proname: string }>>`
      select p.proname
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname = 'is_household_member'
    `;
    expect(helperRows).toHaveLength(1);

    const requiredPolicyRows = await prisma.$queryRaw<Array<{ policyname: string }>>`
      select policyname
      from pg_policies
      where schemaname = 'public'
        and policyname in (
          'members can read household',
          'owner can update household',
          'household members manage pets',
          'household members manage invite codes',
          'household members read members',
          'owner can manage members',
          'household members manage photos',
          'household members manage emergency info',
          'household members manage medical records',
          'household members manage medications',
          'household members manage vaccinations',
          'household members manage emergency token'
        )
    `;

    expect(requiredPolicyRows.map((row) => row.policyname).sort()).toEqual(
      [
        "household members manage emergency info",
        "household members manage emergency token",
        "household members manage invite codes",
        "household members manage medical records",
        "household members manage medications",
        "household members manage pets",
        "household members manage photos",
        "household members manage vaccinations",
        "household members read members",
        "members can read household",
        "owner can manage members",
        "owner can update household"
      ].sort()
    );

    const healthPolicyRows = await prisma.$queryRaw<Array<{ policyname: string }>>`
      select policyname
      from pg_policies
      where schemaname = 'public'
        and policyname in (
          'household members manage core metrics',
          'household members manage lab results',
          'household members manage health extensions'
        )
    `;

    expect([0, 3]).toContain(healthPolicyRows.length);
  });
});
