import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const { prisma } = await import("../src/lib/prisma");

  console.log("=== CHECKING USER MEMBERSHIPS ===");
  const members = await prisma.householdMember.findMany({
    include: {
      household: {
        include: {
          pets: { select: { id: true, name: true } }
        }
      }
    }
  });

  for (const m of members) {
    console.log(`User ID: ${m.userId} -> Household: ${m.household.name} (ID: ${m.householdId}), Pets: ${m.household.pets.map(p => p.name).join(", ")}`);
  }

  // Remove any seed household memberships for real user 450e5487-f224-4a81-8559-0280800a81de
  const realUserId = "450e5487-f224-4a81-8559-0280800a81de";
  const originalHouseholdId = "ae71672f-5f8e-4cda-9950-16be74861997";

  // Clean up any stray memberships in seed households
  await prisma.householdMember.deleteMany({
    where: {
      userId: realUserId,
      householdId: { not: originalHouseholdId }
    }
  });

  // Ensure realUser is OWNER of original household
  await prisma.householdMember.upsert({
    where: {
      householdId_userId: {
        householdId: originalHouseholdId,
        userId: realUserId
      }
    },
    create: {
      householdId: originalHouseholdId,
      userId: realUserId,
      role: "OWNER"
    },
    update: {
      role: "OWNER"
    }
  });

  // Also check all users from Supabase Auth if available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && supabaseServiceKey) {
    const { createClient } = await import("@supabase/supabase-js");
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    if (usersData?.users) {
      console.log("\n=== SUPABASE AUTH USERS ===");
      for (const u of usersData.users) {
        console.log(`Supabase User Email: ${u.email}, ID: ${u.id}`);
        // Ensure every real Supabase user has membership in their original household or original is assigned
        const userMemberships = await prisma.householdMember.findMany({
          where: { userId: u.id },
          include: { household: { include: { pets: true } } }
        });
        console.log(`  Memberships count: ${userMemberships.length}`);
        for (const um of userMemberships) {
          console.log(`   - Belongs to ${um.household.name} (${um.household.pets.length} pets)`);
        }
        if (userMemberships.length === 0) {
          console.log(`  Connecting user ${u.email} (${u.id}) to original household ${originalHouseholdId}...`);
          await prisma.householdMember.create({
            data: {
              householdId: originalHouseholdId,
              userId: u.id,
              role: "OWNER"
            }
          });
        }
      }
    }
  }

  console.log("\n=== DATA RESTORATION COMPLETE ===");
}

main().catch(console.error);
