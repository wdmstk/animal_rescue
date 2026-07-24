import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (process.env.E2E_TEST_MODE === "true" || process.env.NODE_ENV === "test") {
    return NextResponse.json({
      success: true,
      data: [
        {
          id: "demo-announcement-1",
          title: "📢 【システム通知】定期メンテナンス完了のお知らせ",
          body: "いつも「AniLink」をご利用いただきありがとうございます。本日未明の定期システムアップデートおよびデータベース最適化が正常に完了いたしました。",
          isPublished: true,
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          expiresAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    });
  }

  try {
    const now = new Date();
    const announcements = await prisma.announcement.findMany({
      where: {
        isPublished: true,
        publishedAt: { lte: now },
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: now } }
        ]
      },
      orderBy: { publishedAt: "desc" },
      take: 10
    });

    return NextResponse.json({
      success: true,
      data: announcements
    });
  } catch (error: any) {
    console.error("Failed to fetch public announcements:", error);
    return NextResponse.json(
      { success: false, error: "お知らせの取得に失敗しました" },
      { status: 500 }
    );
  }
}
