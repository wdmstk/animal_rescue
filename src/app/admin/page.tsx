import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// Admin access check - only allow specific admin users
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",") || [];

async function requireAdminUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || !user.email) {
    return null;
  }

  if (!ADMIN_EMAILS.includes(user.email)) {
    return null;
  }

  return user;
}

export default async function AdminPage() {
  const adminUser = await requireAdminUser();
  
  if (!adminUser) {
    redirect("/"); // Redirect to home if not admin
  }

  // Fetch all users with their household and billing information
  const users = await prisma.user.findMany({
    include: {
      householdMembers: {
        include: {
          household: {
            include: {
              _count: {
                select: {
                  members: true,
                  pets: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Fetch subscription information
  const subscriptions = await prisma.subscription.findMany({
    include: {
      household: {
        include: {
          members: {
            include: {
              user: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">管理画面</h1>
          <p className="mt-2 text-slate-600">ユーザーと課金状態の管理</p>
        </div>

        {/* Users Section */}
        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-900">ユーザー一覧</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">ユーザーID</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">メールアドレス</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">作成日</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">世帯数</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">ペット数</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">役割</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const householdMember = user.householdMembers[0];
                  const household = householdMember?.household;
                  return (
                    <tr key={user.id} className="border-b border-slate-100">
                      <td className="px-4 py-3 text-slate-600">{user.id.slice(0, 8)}...</td>
                      <td className="px-4 py-3 text-slate-900">{user.email}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(user.createdAt).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {household ? household._count.members : 0}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {household ? household._count.pets : 0}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          householdMember?.role === 'OWNER' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {householdMember?.role || 'なし'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Subscriptions Section */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-900">課金状態一覧</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">サブスクリプションID</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">ステータス</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">プラン</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">トライアル終了日</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">世帯メンバー</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">作成日</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((subscription) => {
                  const memberEmails = subscription.household.members
                    .map(m => m.user.email)
                    .join(", ");
                  
                  const statusColors = {
                    ACTIVE: 'bg-green-100 text-green-700',
                    TRIALING: 'bg-blue-100 text-blue-700',
                    PAST_DUE: 'bg-red-100 text-red-700',
                    CANCELLED: 'bg-slate-100 text-slate-700',
                    INCOMPLETE: 'bg-yellow-100 text-yellow-700',
                  };

                  return (
                    <tr key={subscription.id} className="border-b border-slate-100">
                      <td className="px-4 py-3 text-slate-600">{subscription.id.slice(0, 8)}...</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          statusColors[subscription.status as keyof typeof statusColors] || 'bg-slate-100 text-slate-700'
                        }`}>
                          {subscription.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{subscription.planTier}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {subscription.trialEndsAt 
                          ? new Date(subscription.trialEndsAt).toLocaleDateString('ja-JP')
                          : '-'
                        }
                      </td>
                      <td className="px-4 py-3 text-slate-600">{memberEmails}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(subscription.createdAt).toLocaleDateString('ja-JP')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Statistics */}
        <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">総ユーザー数</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{users.length}</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">総世帯数</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {new Set(users.flatMap(u => u.householdMembers.map(m => m.householdId))).size}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">アクティブサブスクリプション</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {subscriptions.filter(s => s.status === 'ACTIVE' || s.status === 'TRIALING').length}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">総ペット数</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {users.reduce((sum, user) => {
                const household = user.householdMembers[0]?.household;
                return sum + (household?._count.pets || 0);
              }, 0)}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}