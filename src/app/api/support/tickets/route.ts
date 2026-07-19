import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/pet-access";
import { badRequest } from "@/lib/api-error";
import { z } from "zod";

const createTicketSchema = z.object({
  title: z.string().min(1, "件名は必須です").max(100, "件名は100文字以内で入力してください"),
  category: z.enum(["BUG", "FEATURE", "BILLING", "OTHER"]),
  message: z.string().min(1, "メッセージ内容は必須です").max(2000, "メッセージは2000文字以内で入力してください")
});

export async function GET() {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const tickets = await prisma.ticket.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ data: tickets });
}

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const body = await request.json();
    const result = createTicketSchema.safeParse(body);
    if (!result.success) {
      return badRequest(result.error);
    }

    const { title, category, message } = result.data;

    // Use a transaction to create the ticket and its initial message together
    const ticket = await prisma.$transaction(async (tx) => {
      const newTicket = await tx.ticket.create({
        data: {
          userId: auth.userId,
          title,
          category,
          status: "OPEN"
        }
      });

      await tx.ticketMessage.create({
        data: {
          ticketId: newTicket.id,
          senderId: auth.userId,
          isAdmin: false,
          body: message
        }
      });

      return newTicket;
    });

    return NextResponse.json({ data: ticket }, { status: 201 });
  } catch (error: any) {
    return badRequest("不正なリクエスト形式です");
  }
}
