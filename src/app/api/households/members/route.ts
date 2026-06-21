import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { unauthorized, badRequest, notFound } from "@/lib/api-error";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return unauthorized();
  }

  const membership = await prisma.householdMember.findFirst({
    where: { userId: user.id },
    select: { householdId: true, role: true },
    orderBy: { createdAt: "asc" }
  });

  if (!membership) {
    return badRequest("所属世帯が見つかりません");
  }

  const household = await prisma.household.findUnique({
    where: { id: membership.householdId },
    select: {
      id: true,
      name: true,
      members: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          userId: true,
          role: true,
          createdAt: true
        }
      }
    }
  });

  if (!household) {
    return notFound("世帯情報");
  }

  return NextResponse.json({
    data: {
      household,
      currentUserRole: membership.role
    }
  });
}
