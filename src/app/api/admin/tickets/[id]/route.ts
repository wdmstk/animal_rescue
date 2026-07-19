import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUserForApi } from "@/lib/admin/require-admin";
import { notFound } from "@/lib/api-error";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminUserForApi();
  if (admin instanceof NextResponse) {
    return admin;
  }

  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!ticket) {
    return notFound("Ticket");
  }

  // Retrieve submitter profile details
  const profile = await prisma.ownerProfile.findUnique({
    where: { ownerUserId: ticket.userId }
  });

  return NextResponse.json({
    data: {
      ...ticket,
      userProfile: profile ?? { ownerUserId: ticket.userId, fullName: "一般ユーザー", email: null }
    }
  });
}
