import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUserForApi } from "@/lib/admin/require-admin";

export async function GET(request: Request) {
  const admin = await requireAdminUserForApi();
  if (admin instanceof NextResponse) {
    return admin;
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: any = {};
  if (status && ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(status)) {
    where.status = status;
  }

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: { updatedAt: "desc" }
  });

  return NextResponse.json({ data: tickets });
}
