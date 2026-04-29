"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HouseholdInviteCodeCard } from "@/components/features/pets/household-invite-code-card";

type Member = {
  id: string;
  userId: string;
  role: "OWNER" | "FAMILY";
  createdAt: string;
};

type HouseholdPayload = {
  household: {
    id: string;
    name: string;
    members: Member[];
  };
  currentUserRole: "OWNER" | "FAMILY";
};

type AccountPayload = {
  userId: string;
  email: string | null;
  displayName: string | null;
};

type BillingPayload = {
  status: "INCOMPLETE" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID";
  isActive: boolean;
  currentPeriodEnd: string | null;
};

export default function SettingsPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [householdName, setHouseholdName] = useState<string>("");
  const [currentUserRole, setCurrentUserRole] = useState<"OWNER" | "FAMILY">("FAMILY");
  const [account, setAccount] = useState<AccountPayload | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [billing, setBilling] = useState<BillingPayload | null>(null);
  const [isBillingSubmitting, setIsBillingSubmitting] = useState(false);

  const isOwner = currentUserRole === "OWNER";

  const loadData = async () => {
    setErrorMessage(null);

    const [membersRes, accountRes, billingRes] = await Promise.all([
      fetch("/api/households/members"),
      fetch("/api/account"),
      fetch("/api/billing/subscription")
    ]);

    if (!membersRes.ok || !accountRes.ok || !billingRes.ok) {
      setErrorMessage("設定情報の取得に失敗しました。");
      return;
    }

    const membersJson = (await membersRes.json()) as { data: HouseholdPayload };
    const accountJson = (await accountRes.json()) as { data: AccountPayload };
    const billingJson = (await billingRes.json()) as { data: BillingPayload };

    setHouseholdName(membersJson.data.household.name);
    setMembers(membersJson.data.household.members);
    setCurrentUserRole(membersJson.data.currentUserRole);
    setAccount(accountJson.data);
    setDisplayName(accountJson.data.displayName ?? "");
    setBilling(billingJson.data);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, []);

  const roleLabel = useMemo(() => ({ OWNER: "OWNER", FAMILY: "FAMILY" }), []);

  const handleRoleChange = async (memberId: string, nextRole: "OWNER" | "FAMILY") => {
    setErrorMessage(null);
    setMessage(null);

    const response = await fetch(`/api/households/members/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole })
    });

    if (!response.ok) {
      setErrorMessage("権限更新に失敗しました。");
      return;
    }

    setMessage("メンバー権限を更新しました。");
    await loadData();
  };

  const handleSubmitAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setMessage(null);

    const nextDisplayName = displayName.trim();
    const currentDisplayName = account?.displayName?.trim() ?? "";
    const hasPassword = password.trim().length > 0;
    const isDisplayNameChanged = nextDisplayName !== currentDisplayName;

    if (!isDisplayNameChanged && !hasPassword) {
      setMessage("更新する項目がありません。");
      return;
    }

    const payload: { displayName?: string; password?: string } = {};
    if (isDisplayNameChanged && nextDisplayName.length > 0) {
      payload.displayName = nextDisplayName;
    }
    if (hasPassword) {
      payload.password = password;
    }

    const response = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const responsePayload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setErrorMessage(
        typeof responsePayload?.error === "string" ? responsePayload.error : "アカウント更新に失敗しました。"
      );
      return;
    }

    setPassword("");
    setMessage("アカウント情報を更新しました。");
    await loadData();
  };

  const handleLogout = async () => {
    setErrorMessage(null);
    const response = await fetch("/api/auth/logout", { method: "POST" });
    if (!response.ok) {
      setErrorMessage("ログアウトに失敗しました。");
      return;
    }
    router.push("/login");
    router.refresh();
  };

  const handleStartBilling = async () => {
    setErrorMessage(null);
    setIsBillingSubmitting(true);

    const response = await fetch("/api/billing/checkout", { method: "POST" });
    const payload = (await response.json().catch(() => null)) as { data?: { url?: string }; error?: string } | null;

    if (!response.ok || !payload?.data?.url) {
      setIsBillingSubmitting(false);
      setErrorMessage(typeof payload?.error === "string" ? payload.error : "課金ページの作成に失敗しました。");
      return;
    }

    window.location.href = payload.data.url;
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">家族情報</h2>
        <p className="mt-1 text-sm text-slate-600">世帯: {householdName || "-"}</p>
        <p className="mt-1 text-xs text-slate-500">あなたの権限: {roleLabel[currentUserRole]}</p>
        <div className="mt-2">
          <Link href="/invite/join" className="text-sm font-semibold text-slate-900 underline">
            招待コードで家族に参加する
          </Link>
        </div>
        <div className="mt-3 space-y-2">
          {members.map((member) => (
            <div key={member.id} className="rounded-lg border border-slate-200 p-3 text-sm">
              <p className="font-medium text-slate-900">User ID: {member.userId}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-slate-600">Role: {member.role}</span>
                {isOwner ? (
                  <>
                    <button
                      type="button"
                      className="rounded bg-slate-900 px-2 py-1 text-xs font-semibold text-white"
                      onClick={() => handleRoleChange(member.id, "OWNER")}
                    >
                      OWNER
                    </button>
                    <button
                      type="button"
                      className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-800"
                      onClick={() => handleRoleChange(member.id, "FAMILY")}
                    >
                      FAMILY
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>
      {isOwner ? <HouseholdInviteCodeCard /> : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">課金プラン</h2>
        <p className="mt-1 text-sm text-slate-600">月額500円（Stripe定期課金）</p>
        <p className="mt-2 text-xs text-slate-500">契約状態: {billing?.status ?? "INCOMPLETE"}</p>
        <p className="mt-1 text-xs text-slate-500">
          有効期限: {billing?.currentPeriodEnd ? new Date(billing.currentPeriodEnd).toLocaleString("ja-JP") : "-"}
        </p>
        <button
          type="button"
          className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          onClick={handleStartBilling}
          disabled={Boolean(billing?.isActive) || isBillingSubmitting}
        >
          {billing?.isActive ? "契約中" : isBillingSubmitting ? "遷移中..." : "月額500円で申し込む"}
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">ログイン情報</h2>
        <p className="mt-1 text-sm text-slate-600">メール: {account?.email ?? "-"}</p>

        <form className="mt-3 space-y-3" onSubmit={handleSubmitAccount}>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">表示名</label>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="表示名"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">新しいパスワード</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="8文字以上"
            />
          </div>
          <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white" type="submit">
            更新する
          </button>
        </form>
      </section>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {errorMessage ? <p className="text-sm text-rose-700">{errorMessage}</p> : null}
      <button
        type="button"
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
        onClick={handleLogout}
      >
        ログアウト
      </button>
    </div>
  );
}
