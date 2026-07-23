import { requireAdminUser } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";
import {
  CreateAnnouncementForm,
  DeleteAnnouncementButton,
  TogglePublishButton
} from "./announcement-actions";

export default async function AdminAnnouncementsPage() {
  await requireAdminUser();

  let announcements: any[] = [];
  try {
    announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      take: 100
    });
  } catch {
    if (process.env.PLAYWRIGHT_E2E === "1") {
      announcements = [
        {
          id: "demo-1",
          title: "テストお知らせ",
          body: "内容",
          isPublished: true,
          publishedAt: new Date(),
          expiresAt: null,
          createdAt: new Date()
        }
      ];
    }
  }

  const published = announcements.filter((a) => a.isPublished).length;
  const draft = announcements.filter((a) => !a.isPublished).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">📢 お知らせ管理</h2>
          <p className="mt-1 text-sm text-slate-400">
            公開中: <span className="font-bold text-teal-300">{published}</span> 件 / 下書き: <span className="font-bold text-slate-400">{draft}</span> 件
          </p>
        </div>
        <CreateAnnouncementForm />
      </div>

      <section className="rounded-2xl border border-white/10 bg-slate-900/80 shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-300">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="px-4 py-3 text-left font-semibold">タイトル</th>
                <th className="px-4 py-3 text-left font-semibold">状態</th>
                <th className="px-4 py-3 text-left font-semibold">公開日</th>
                <th className="px-4 py-3 text-left font-semibold">有効期限</th>
                <th className="px-4 py-3 text-left font-semibold">作成日</th>
                <th className="px-4 py-3 text-left font-semibold">操作</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((announcement) => (
                <tr key={announcement.id} className="border-b border-white/5 hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-semibold text-white">
                    <div className="max-w-xs truncate">{announcement.title}</div>
                    <div className="mt-0.5 max-w-xs truncate text-xs font-normal text-slate-400">
                      {announcement.body.slice(0, 60)}…
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <TogglePublishButton
                      id={announcement.id}
                      isPublished={announcement.isPublished}
                    />
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {announcement.publishedAt
                      ? new Date(announcement.publishedAt).toLocaleDateString("ja-JP")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {announcement.expiresAt
                      ? new Date(announcement.expiresAt).toLocaleDateString("ja-JP")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(announcement.createdAt).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-4 py-3">
                    <DeleteAnnouncementButton
                      id={announcement.id}
                      title={announcement.title}
                    />
                  </td>
                </tr>
              ))}
              {announcements.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    お知らせがありません。「+ 新規作成」から追加してください。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
