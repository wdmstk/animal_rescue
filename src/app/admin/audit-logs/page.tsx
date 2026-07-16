import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// Admin access check - only allow specific admin users
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",") || [];

async function requireAdminUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user || !user.email) {
    return null;
  }

  if (!ADMIN_EMAILS.includes(user.email)) {
    return null;
  }

  return user;
}

export default async function AuditLogsPage() {
  const adminUser = await requireAdminUser();
  
  if (!adminUser) {
    redirect("/"); // Redirect to home if not admin
  }

  // Fetch audit logs with pagination
  const logs = await prisma.auditLog.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    take: 100 // Limit to last 100 logs
  });

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">監査ログ</h1>
          <p className="mt-2 text-slate-600">システム操作の監査ログ</p>
        </div>

        {/* Audit Logs Section */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-900">操作ログ一覧</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">ユーザーID</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">操作</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">エンティティ</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">エンティティID</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">変更内容</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">IPアドレス</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">日時</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 text-slate-600">{log.id.slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-slate-900">{log.userId.slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{log.entityType}</td>
                    <td className="px-4 py-3 text-slate-600">{log.entityId.slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-slate-600">
                      {log.changes ? (
                        <pre className="text-xs bg-slate-50 p-2 rounded max-w-xs overflow-hidden">
                          {JSON.stringify(JSON.parse(log.changes as string), null, 2)}
                        </pre>
                      ) : "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{log.ipAddress || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(log.createdAt).toLocaleString('ja-JP')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Statistics */}
        <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">総ログ数</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{logs.length}</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">ユニークユーザーID</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {new Set(logs.map(l => l.userId)).size}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">操作種類</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {new Set(logs.map(l => l.action)).size}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">過去24時間</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {(() => {
                const now = new Date();
                return logs.filter(l => {
                  const logDate = new Date(l.createdAt);
                  const hoursAgo = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60);
                  return hoursAgo < 24;
                }).length;
              })()}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}