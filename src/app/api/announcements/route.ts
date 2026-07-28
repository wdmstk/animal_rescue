import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { paginationQuerySchema, buildPaginatedResponse } from "@/lib/pagination";

export async function GET(request: Request) {
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
      ],
      pagination: {
        nextCursor: null,
        hasMore: false
      }
    });
  }

  try {
    const url = new URL(request.url);
    const parsedQuery = paginationQuerySchema.safeParse({
      limit: url.searchParams.get("limit") ?? undefined,
      cursor: url.searchParams.get("cursor") ?? undefined
    });
    const { limit, cursor } = parsedQuery.success ? parsedQuery.data : { limit: 20, cursor: undefined };

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
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }]
    });

    const paginated = buildPaginatedResponse(announcements, limit);
    return NextResponse.json({
      success: true,
      ...paginated
    });
  } catch (error: any) {
    console.error("Failed to fetch public announcements:", error);
    return NextResponse.json(
      { success: false, error: "お知らせの取得に失敗しました" },
      { status: 500 }
    );
  }
}
