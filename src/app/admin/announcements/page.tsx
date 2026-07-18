import { requireAdminUser } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";
import {
  CreateAnnouncementForm,
  DeleteAnnouncementButton,
  TogglePublishButton
} from "./announcement-actions";

export default async function AdminAnnouncementsPage() {
  await requireAdminUser();

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: 100
  });

  const published = announcements.filter((a) => a.isPublished).length;
  const draft = announcements.filter((a) => !a.isPublished).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">お知らせ管理</h2>
          <p className="mt-1 text-sm text-slate-500">
            公開中: {published} 件 / 下書き: {draft} 件
          </p>
        </div>
        <CreateAnnouncementForm />
      </div>

      <section className="rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-left font-semibold text-slate-600">タイトル</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">状態</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">公開日</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">有効期限</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">作成日</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((announcement) => (
                <tr key={announcement.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800">
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
