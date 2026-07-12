import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/billing/stripe";
import { accountUpdateSchema } from "@/lib/validators/account";
import { badRequest, unauthorized, apiError } from "@/lib/api-error";

const resolveDisplayName = (metadata: unknown): string | null => {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  const value = (metadata as { display_name?: unknown }).display_name;
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
};

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return unauthorized();
  }

  return NextResponse.json({
    data: {
      userId: user.id,
      email: user.email ?? null,
      displayName: resolveDisplayName(user.user_metadata)
    }
  });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = accountUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(parsed.error);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return unauthorized();
  }

  const updatePayload: { password?: string; data?: { display_name?: string } } = {};

  if (parsed.data.password) {
    updatePayload.password = parsed.data.password;
  }
  if (parsed.data.displayName) {
    updatePayload.data = { display_name: parsed.data.displayName };
  }

  const { error: updateError } = await supabase.auth.updateUser(updatePayload);
  if (updateError) {
    return badRequest(updateError.message);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return unauthorized();
  }

  // Get user's household membership
  const membership = await prisma.householdMember.findFirst({
    where: { userId: user.id },
    select: {
      id: true,
      householdId: true,
      role: true
    }
  });

  if (!membership) {
    return badRequest("所属世帯が見つかりません");
  }

  // OWNER deletion guard: prevent last OWNER from deleting if other members exist
  if (membership.role === "OWNER") {
    const ownerCount = await prisma.householdMember.count({
      where: {
        householdId: membership.householdId,
        role: "OWNER"
      }
    });

    const totalMemberCount = await prisma.householdMember.count({
      where: {
        householdId: membership.householdId
      }
    });

    if (ownerCount === 1 && totalMemberCount > 1) {
      return apiError(
        "最後のOWNERは、他のメンバーがいる世帯を削除できません。先に権限を移譲するか、メンバーを削除してください。",
        409
      );
    }
  }

  // Cancel Stripe subscription if exists
  try {
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId: user.id },
      select: { stripeSubscriptionId: true }
    });

    if (subscription?.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    }
  } catch (error) {
    console.error("Failed to cancel Stripe subscription:", error);
    // Continue with deletion even if Stripe cancellation fails
  }

  // Delete user data using Prisma transaction
  try {
    await prisma.$transaction([
      prisma.userSubscription.deleteMany({ where: { userId: user.id } }),
      prisma.ownerDisplaySettings.deleteMany({ where: { ownerUserId: user.id } }),
      prisma.ownerProfile.deleteMany({ where: { ownerUserId: user.id } }),
      prisma.householdMember.deleteMany({ where: { userId: user.id } })
    ]);
  } catch (error) {
    console.error("Failed to delete user data:", error);
    return apiError("アカウント削除に失敗しました", 500);
  }

  // Delete Supabase Auth user
  try {
    const supabaseAdmin = createSupabaseServiceRoleClient();
    await supabaseAdmin.auth.admin.deleteUser(user.id);
  } catch (error) {
    console.error("Failed to delete Supabase auth user:", error);
    // Continue even if auth deletion fails - DB data is already deleted
  }

  return NextResponse.json({ ok: true });
}
