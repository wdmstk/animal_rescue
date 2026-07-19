import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/pet-access";
import { forbidden, notFound } from "@/lib/api-error";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
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

  if (ticket.userId !== auth.userId) {
    return forbidden("この問い合わせへのアクセス権限がありません");
  }

  return NextResponse.json({ data: ticket });
}
