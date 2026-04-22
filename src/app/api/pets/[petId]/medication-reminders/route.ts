import { NextResponse } from "next/server";
import { z } from "zod";

const reminderSettingSchema = z.object({
  channel: z.enum(["email", "line", "webhook"]),
  destination: z.string().min(1),
  enabled: z.boolean()
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = reminderSettingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  return NextResponse.json({
    data: {
      ...parsed.data,
      status: "saved_as_integration_stub"
    }
  });
}
