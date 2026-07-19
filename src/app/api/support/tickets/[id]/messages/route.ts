import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/pet-access";
import { badRequest, forbidden, notFound } from "@/lib/api-error";
import { z } from "zod";

const createMessageSchema = z.object({
  body: z.string().min(1, "メッセージ内容は必須です").max(2000, "メッセージは2000文字以内で入力してください")
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { id } = await params;

  // Retrieve ticket to check ownership and existence
  const ticket = await prisma.ticket.findUnique({
    where: { id }
  });

  if (!ticket) {
    return notFound("Ticket");
  }

  if (ticket.userId !== auth.userId) {
    return forbidden("この問い合わせへの返信権限がありません");
  }

  try {
    const json = await request.json();
    const result = createMessageSchema.safeParse(json);
    if (!result.success) {
      return badRequest(result.error);
    }

    const { body } = result.data;

    // Use a transaction to create the message and update the ticket status/updatedAt
    const message = await prisma.$transaction(async (tx) => {
      const msg = await tx.ticketMessage.create({
        data: {
          ticketId: id,
          senderId: auth.userId,
          isAdmin: false,
          body
        }
      });

      await tx.ticket.update({
        where: { id },
        data: {
          status: "OPEN", // User response sets status back to OPEN for admins to notice
          updatedAt: new Date()
        }
      });

      return msg;
    });

    return NextResponse.json({ data: message }, { status: 201 });
  } catch (error: any) {
    return badRequest("不正なリクエスト形式です");
  }
}
