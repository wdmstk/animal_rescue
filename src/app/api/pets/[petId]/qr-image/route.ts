import { NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(_: Request, { params }: { params: { petId: string } }) {
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/e/${params.petId}`;
  const image = await QRCode.toDataURL(publicUrl, {
    width: 320,
    margin: 1
  });

  return NextResponse.json({ data: { publicUrl, image } });
}
