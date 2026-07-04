import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/pet-access";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveBillingAccessState } from "@/lib/billing/access-policy";
import { ClientSettings } from "./_client-settings";

type Member = {
  id: string;
  userId: string;
  role: "OWNER" | "FAMILY";
  createdAt: string;
};

type AccountPayload = {
  userId: string;
  email: string | null;
  displayName: string | null;
};

type BillingPayload = {
  planTier: "trial" | "paid" | "free";
  subscriptionStatus: "INCOMPLETE" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID" | "GRACE";
  status: "INCOMPLETE" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID" | "GRACE";
  isActive: boolean;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  accessPolicy: {
    canCreate: boolean;
    canEdit: boolean;
    canNotify: boolean;
    canShare: boolean;
    canExport: boolean;
    historyWindowDays: number | null;
  };
};

type PetListItem = {
  id: string;
  name: string;
};

type OwnerDisplaySettings = {
  ownerUserId: string;
  showMedicationCard: boolean;
  showVaccinationCard: boolean;
  showHealthCard: boolean;
  showMedicalRecordCard: boolean;
  showEmergencyMedicationSummary: boolean;
  showEmergencyVaccinationSummary: boolean;
  showEmergencyMedicalRecordSummary: boolean;
};

type OwnerProfile = {
  ownerUserId: string;
  fullName: string | null;
  phone: string | null;
  email: string | null;
  postalCode: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  note: string | null;
};

const resolveDisplayName = (metadata: unknown): string | null => {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  const value = (metadata as { display_name?: unknown }).display_name;
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
};

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ e2e?: string }> }) {
  // Server-side authentication
  const auth = await requireAuthenticatedUser();
  if (auth instanceof Response) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;

  // Fetch account info
  const isE2E = process.env.E2E_TEST_MODE === "true";
  let account: AccountPayload;
  if (isE2E) {
    account = {
      userId: "test-user-id",
      email: "test@example.com",
      displayName: "Test User"
    };
  } else {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      redirect("/login");
    }

    account = {
      userId: user.id,
      email: user.email ?? null,
      displayName: resolveDisplayName(user.user_metadata)
    };
  }

  // Fetch household info
  const e2eTestType = resolvedSearchParams.e2e;
  const household = isE2E ? (() => {
    const baseHousehold: {
      id: string;
      name: string;
      members: Array<{ id: string; userId: string; role: "OWNER" | "FAMILY"; createdAt: string }>;
    } = {
      id: "h1",
      name: "Test Household",
      members: [
        { id: "m1", userId: "test-user-id", role: "OWNER", createdAt: "2026-04-29T00:00:00.000Z" }
      ]
    };

    // Customize based on test type
    if (e2eTestType === "family_member") {
      baseHousehold.members = [
        { id: "m1", userId: "test-user-id", role: "FAMILY", createdAt: "2026-04-29T00:00:00.000Z" }
      ];
    } else if (e2eTestType === "no_owner") {
      baseHousehold.members = [
        { id: "m1", userId: "test-user-id", role: "FAMILY", createdAt: "2026-04-29T00:00:00.000Z" }
      ];
    } else if (e2eTestType === "multiple_members") {
      baseHousehold.members = [
        { id: "m1", userId: "u1", role: "FAMILY", createdAt: "2026-04-28T00:00:00.000Z" },
        { id: "m2", userId: "test-user-id", role: "FAMILY", createdAt: "2026-04-29T00:00:00.000Z" }
      ];
    }

    return baseHousehold;
  })() : await prisma.household.findFirst({
    where: {
      members: {
        some: { userId: auth.userId }
      }
    },
    include: {
      members: {
        select: {
          id: true,
          userId: true,
          role: true,
          createdAt: true
        },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!household) {
    redirect("/pets");
  }

  // Convert Date to string for members
  const members = household.members.map(member => ({
    ...member,
    createdAt: typeof member.createdAt === 'string' ? member.createdAt : member.createdAt.toISOString(),
    role: member.role as "OWNER" | "FAMILY"
  }));

  const currentUser = members.find((m) => m.userId === auth.userId);
  const currentUserRole = currentUser?.role ?? "FAMILY";

  // Fetch billing info
  const subscription = isE2E ? (() => {
    if (e2eTestType === "paid_subscription") {
      return {
        status: "ACTIVE" as const,
        trialEndsAt: null,
        currentPeriodEnd: new Date("2026-06-01T00:00:00.000Z"),
        graceUntil: null
      };
    }
    return null;
  })() : (currentUser ? await prisma.userSubscription.findUnique({
    where: { userId: currentUser.userId },
    select: {
      status: true,
      trialEndsAt: true,
      currentPeriodEnd: true,
      graceUntil: true
    }
  }) : null);

  const resolved = resolveBillingAccessState(subscription);

  const billingPayload: BillingPayload = {
    planTier: resolved.planTier,
    subscriptionStatus: resolved.subscriptionStatus,
    status: resolved.subscriptionStatus,
    isActive: resolved.isActive,
    trialEndsAt: resolved.trialEndsAt,
    currentPeriodEnd: resolved.currentPeriodEnd,
    accessPolicy: resolved.accessPolicy
  };

  // Fetch pets
  const pets = isE2E ? [] : await prisma.pet.findMany({
    where: { householdId: household.id },
    select: {
      id: true,
      name: true
    }
  });

  // Fetch owner display settings
  const ownerMember = members.find((m) => m.role === "OWNER");
  let ownerDisplaySettings: OwnerDisplaySettings | null = null;
  if (ownerMember && !isE2E) {
    const settings = await prisma.ownerDisplaySettings.findUnique({
      where: { ownerUserId: ownerMember.userId }
    });
    if (settings) {
      ownerDisplaySettings = {
        ownerUserId: settings.ownerUserId,
        showMedicationCard: settings.showMedicationCard,
        showVaccinationCard: settings.showVaccinationCard,
        showHealthCard: settings.showHealthCard,
        showMedicalRecordCard: settings.showMedicalRecordCard,
        showEmergencyMedicationSummary: settings.showEmergencyMedicationSummary,
        showEmergencyVaccinationSummary: settings.showEmergencyVaccinationSummary,
        showEmergencyMedicalRecordSummary: settings.showEmergencyMedicalRecordSummary
      };
    }
  } else if (ownerMember && isE2E) {
    // E2E mode: provide default display settings
    ownerDisplaySettings = {
      ownerUserId: ownerMember.userId,
      showMedicationCard: true,
      showVaccinationCard: true,
      showHealthCard: true,
      showMedicalRecordCard: true,
      showEmergencyMedicationSummary: true,
      showEmergencyVaccinationSummary: true,
      showEmergencyMedicalRecordSummary: true
    };
  }

  // Fetch owner profile
  let ownerProfile: OwnerProfile | null = null;
  if (ownerMember && !isE2E) {
    const profile = await prisma.ownerProfile.findUnique({
      where: { ownerUserId: ownerMember.userId }
    });
    if (profile) {
      ownerProfile = {
        ownerUserId: profile.ownerUserId,
        fullName: profile.fullName,
        phone: profile.phone,
        email: profile.email,
        postalCode: profile.postalCode,
        addressLine1: profile.addressLine1,
        addressLine2: profile.addressLine2,
        note: profile.note
      };
    }
  } else if (ownerMember && isE2E) {
    // E2E mode: provide default owner profile
    ownerProfile = {
      ownerUserId: ownerMember.userId,
      fullName: null,
      phone: null,
      email: null,
      postalCode: null,
      addressLine1: null,
      addressLine2: null,
      note: null
    };
  }

  return (
    <ClientSettings
      initialHouseholdName={household.name}
      initialMembers={members}
      initialCurrentUserRole={currentUserRole}
      initialAccount={account}
      initialBilling={billingPayload}
      initialPets={pets}
      initialOwnerDisplaySettings={ownerDisplaySettings}
      initialOwnerProfile={ownerProfile}
    />
  );
}