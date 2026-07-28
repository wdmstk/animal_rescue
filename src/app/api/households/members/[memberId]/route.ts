import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireShareAccess } from "@/lib/billing/access-guard";
import { householdMemberRoleUpdateSchema } from "@/lib/validators/household-member";
import { badRequest, unauthorized, forbidden, notFound, apiError } from "@/lib/api-error";
import { logMemberAction, AuditAction } from "@/lib/audit-log";

type Params = {
  params: Promise<{ memberId: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const { memberId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = householdMemberRoleUpdateSchema.safeParse(body);

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
  const shareAccess = await requireShareAccess(user.id);
  if (shareAccess instanceof NextResponse) {
    return shareAccess;
  }

  const actorMembership = await prisma.householdMember.findFirst({
    where: { userId: user.id },
    select: { householdId: true, role: true },
    orderBy: { createdAt: "asc" }
  });

  if (!actorMembership) {
    return badRequest("所属世帯が見つかりません");
  }

  if (actorMembership.role !== "OWNER") {
    return forbidden();
  }

  const targetMember = await prisma.householdMember.findFirst({
    where: {
      id: memberId,
      householdId: actorMembership.householdId
    },
    select: { id: true, userId: true, role: true }
  });

  if (!targetMember) {
    return notFound("メンバー");
  }

  if (targetMember.role === "OWNER" && parsed.data.role === "FAMILY") {
    const ownerCount = await prisma.householdMember.count({
      where: {
        householdId: actorMembership.householdId,
        role: "OWNER"
      }
    });

    if (ownerCount <= 1) {
      return apiError("OWNERを0人にはできません", 409);
    }
  }

  const updated = await prisma.householdMember.update({
    where: { id: targetMember.id },
    data: { role: parsed.data.role },
    select: {
      id: true,
      userId: true,
      role: true,
      createdAt: true
    }
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { memberId } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return unauthorized();
  }
  const shareAccess = await requireShareAccess(user.id);
  if (shareAccess instanceof NextResponse) {
    return shareAccess;
  }

  const actorMembership = await prisma.householdMember.findFirst({
    where: { userId: user.id },
    select: { householdId: true, role: true },
    orderBy: { createdAt: "asc" }
  });

  if (!actorMembership) {
    return badRequest("所属世帯が見つかりません");
  }

  if (actorMembership.role !== "OWNER") {
    return forbidden();
  }

  const targetMember = await prisma.householdMember.findFirst({
    where: {
      id: memberId,
      householdId: actorMembership.householdId
    },
    select: { id: true, userId: true, role: true }
  });

  if (!targetMember) {
    return notFound("メンバー");
  }

  if (targetMember.userId === user.id) {
    return apiError("自分自身を除外することはできません", 409);
  }

  if (targetMember.role === "OWNER") {
    const ownerCount = await prisma.householdMember.count({
      where: {
        householdId: actorMembership.householdId,
        role: "OWNER"
      }
    });

    if (ownerCount <= 1) {
      return apiError("OWNERを0人にはできません", 409);
    }
  }

  await prisma.householdMember.delete({
    where: { id: targetMember.id }
  });

  void logMemberAction(
    user.id,
    AuditAction.MEMBER_REMOVE,
    targetMember.id,
    { removedUserId: targetMember.userId, role: targetMember.role }
  );

  return new NextResponse(null, { status: 204 });
}

