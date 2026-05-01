import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireShareAccess } from "@/lib/billing/access-guard";
import { householdMemberRoleUpdateSchema } from "@/lib/validators/household-member";

type Params = {
  params: Promise<{ memberId: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const { memberId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = householdMemberRoleUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
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
    return NextResponse.json({ error: "所属世帯が見つかりません" }, { status: 400 });
  }

  if (actorMembership.role !== "OWNER") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const targetMember = await prisma.householdMember.findFirst({
    where: {
      id: memberId,
      householdId: actorMembership.householdId
    },
    select: { id: true, userId: true, role: true }
  });

  if (!targetMember) {
    return NextResponse.json({ error: "メンバーが見つかりません" }, { status: 404 });
  }

  if (targetMember.role === "OWNER" && parsed.data.role === "FAMILY") {
    const ownerCount = await prisma.householdMember.count({
      where: {
        householdId: actorMembership.householdId,
        role: "OWNER"
      }
    });

    if (ownerCount <= 1) {
      return NextResponse.json({ error: "OWNERを0人にはできません" }, { status: 409 });
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
