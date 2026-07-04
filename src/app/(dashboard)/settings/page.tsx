import { redirect } from "next/navigation";
import { requireAuthenticatedUser } from "@/lib/auth/pet-access";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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

export default async function SettingsPage() {
  // Server-side authentication
  const auth = await requireAuthenticatedUser();
  if (auth instanceof Response) {
    redirect("/login");
  }

  // Fetch account info
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const account: AccountPayload = {
    userId: user.id,
    email: user.email ?? null,
    displayName: resolveDisplayName(user.user_metadata)
  };

  // Fetch household info
  const household = await prisma.household.findFirst({
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

  const currentUser = household.members.find((m) => m.userId === auth.userId);
  const currentUserRole = currentUser?.role ?? "FAMILY";

  // Fetch billing info
  const billing = await prisma.billing.findUnique({
    where: { householdId: household.id }
  });

  const billingPayload: BillingPayload = billing ? {
    planTier: billing.planTier,
    subscriptionStatus: billing.subscriptionStatus,
    status: billing.subscriptionStatus,
    isActive: billing.isActive,
    trialEndsAt: billing.trialEndsAt?.toISOString() ?? null,
    currentPeriodEnd: billing.currentPeriodEnd?.toISOString() ?? null,
    accessPolicy: {
      canCreate: billing.accessPolicy.canCreate,
      canEdit: billing.accessPolicy.canEdit,
      canNotify: billing.accessPolicy.canNotify,
      canShare: billing.accessPolicy.canShare,
      canExport: billing.accessPolicy.canExport,
      historyWindowDays: billing.accessPolicy.historyWindowDays
    }
  } : {
    planTier: "free",
    subscriptionStatus: "INCOMPLETE",
    status: "INCOMPLETE",
    isActive: false,
    trialEndsAt: null,
    currentPeriodEnd: null,
    accessPolicy: {
      canCreate: false,
      canEdit: false,
      canNotify: false,
      canShare: false,
      canExport: false,
      historyWindowDays: null
    }
  };

  // Fetch pets
  const pets = await prisma.pet.findMany({
    where: { householdId: household.id },
    select: {
      id: true,
      name: true
    }
  });

  // Fetch owner display settings
  const ownerMember = household.members.find((m) => m.role === "OWNER");
  let ownerDisplaySettings: OwnerDisplaySettings | null = null;
  if (ownerMember) {
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
  }

  // Fetch owner profile
  let ownerProfile: OwnerProfile | null = null;
  if (ownerMember) {
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
  }

  return (
    <ClientSettings
      initialHouseholdName={household.name}
      initialMembers={household.members}
      initialCurrentUserRole={currentUserRole}
      initialAccount={account}
      initialBilling={billingPayload}
      initialPets={pets}
      initialOwnerDisplaySettings={ownerDisplaySettings}
      initialOwnerProfile={ownerProfile}
    />
  );
}