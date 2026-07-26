import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const { prisma } = await import("../src/lib/prisma");

  console.log("\n==========================================");
  console.log("=== SUMMARY OF ALL HOUSEHOLDS & MEMBERS ===");
  console.log("==========================================");
  const households = await prisma.household.findMany({
    include: {
      members: true,
      pets: { select: { id: true, name: true, species: true } }
    }
  });

  for (const h of households) {
    console.log(`\n[Household ID]: ${h.id}`);
    console.log(` [Household Name]: ${h.name}`);
    console.log(` [Members]:`);
    for (const m of h.members) {
      console.log(`   - Member ID: ${m.id}, User ID: ${m.userId}, Role: ${m.role}`);
    }
    console.log(` [Pets (${h.pets.length})]:`);
    for (const p of h.pets) {
      console.log(`   - Pet ID: ${p.id}, Name: ${p.name}, Species: ${p.species}`);
    }
  }

  console.log("\n==========================================");
  console.log("=== ALL PETS IN DB ===");
  console.log("==========================================");
  const pets = await prisma.pet.findMany({
    select: { id: true, name: true, species: true, householdId: true }
  });
  for (const p of pets) {
    console.log(`- Pet: ${p.name} (ID: ${p.id}, Species: ${p.species}, Household: ${p.householdId})`);
  }
}

main().catch(console.error);
