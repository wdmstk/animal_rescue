import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireShareAccess } from "@/lib/billing/access-guard";
import { createInviteCodeSchema } from "@/lib/validators/invite";
import { calculateExpiry, generateInviteCode } from "@/lib/services/invite-code";
import { badRequest, unauthorized, forbidden } from "@/lib/api-error";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createInviteCodeSchema.partial({ householdId: true }).safeParse(body);

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

  const membership = await prisma.householdMember.findFirst({
    where: parsed.data.householdId
      ? {
          userId: user.id,
          householdId: parsed.data.householdId
        }
      : { userId: user.id },
    select: { householdId: true, role: true },
    orderBy: { createdAt: "asc" }
  });

  if (!membership) {
    return badRequest("所属世帯が見つかりません");
  }
  if (membership.role !== "OWNER") {
    return forbidden("招待コード発行権限がありません");
  }

  const shareAccess = await requireShareAccess(user.id);
  if (shareAccess instanceof NextResponse) {
    return shareAccess;
  }

  const code = generateInviteCode();
  const invite = await prisma.householdInviteCode.create({
    data: {
      householdId: membership.householdId,
      createdBy: user.id,
      code,
      expiresAt: calculateExpiry(parsed.data.expiresInHours)
    }
  });

  return NextResponse.json({ data: invite }, { status: 201 });
}
