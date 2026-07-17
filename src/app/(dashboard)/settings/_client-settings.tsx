"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HouseholdInviteCodeCard } from "@/components/features/pets/household-invite-code-card";
import { ToastMessage } from "@/components/ui/toast-message";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Member = {
  id: string;
  userId: string;
  role: "OWNER" | "FAMILY";
  createdAt: string;
};

type AccountPayload = {
  userId: string;
  email: string | null;
  displayName: string | null;
};

type BillingPayload = {
  planTier: "trial" | "paid" | "free";
  subscriptionStatus: "INCOMPLETE" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID" | "GRACE";
  status: "INCOMPLETE" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID" | "GRACE";
  isActive: boolean;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  accessPolicy: {
    canCreate: boolean;
    canEdit: boolean;
    canNotify: boolean;
    canShare: boolean;
    canExport: boolean;
    historyWindowDays: number | null;
  };
};

type PetListItem = {
  id: string;
  name: string;
};

type OwnerDisplaySettings = {
  ownerUserId: string;
  showMedicationCard: boolean;
  showVaccinationCard: boolean;
  showHealthCard: boolean;
  showMedicalRecordCard: boolean;
  showEmergencyMedicationSummary: boolean;
  showEmergencyVaccinationSummary: boolean;
  showEmergencyMedicalRecordSummary: boolean;
};

type OwnerProfile = {
  ownerUserId: string;
  fullName: string | null;
  phone: string | null;
  email: string | null;
  postalCode: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  note: string | null;
};

type BillingActionCopy = {
  badgeLabel: string;
  statusLabel: string;
  headline: string;
  detail: string;
  ctaLabel: string;
  ctaAction: "checkout" | "portal";
};

const BILLING_ACTION_COPY: Record<BillingPayload["subscriptionStatus"], BillingActionCopy> = {
  INCOMPLETE: {
    badgeLabel: "未契約",
    statusLabel: "無料トライアルを開始できます",
    headline: "30日無料で使い始めましょう",
    detail: "課金が始まる前に、編集・通知・共有を含む全機能をお試しいただけます。",
    ctaLabel: "無料トライアルを開始する",
    ctaAction: "checkout"
  },
  TRIALING: {
    badgeLabel: "トライアル中",
    statusLabel: "全機能を利用中です",
    headline: "30日後に月額680円プランへ自動移行します",
    detail: "移行前でも、契約管理からいつでも支払い方法の更新や解約ができます。",
    ctaLabel: "契約を管理する",
    ctaAction: "portal"
  },
  ACTIVE: {
    badgeLabel: "契約中",
    statusLabel: "全機能を利用中です",
    headline: "契約は有効です",
    detail: "契約管理から、いつでも支払い方法の変更や解約ができます。",
    ctaLabel: "契約を管理する",
    ctaAction: "portal"
  },
  PAST_DUE: {
    badgeLabel: "要対応",
    statusLabel: "支払い確認待ちです",
    headline: "支払い情報を確認してください",
    detail: "契約管理で支払い情報を更新すると、機能制限の解除につながります。",
    ctaLabel: "契約を管理する",
    ctaAction: "portal"
  },
  CANCELED: {
    badgeLabel: "停止中",
    statusLabel: "契約が終了しています",
    headline: "再開すると全機能がすぐ戻ります",
    detail: "停止中でも安全情報は閲覧できます。必要なタイミングでいつでも再開できます。",
    ctaLabel: "無料トライアルを開始する",
    ctaAction: "checkout"
  },
  UNPAID: {
    badgeLabel: "停止中",
    statusLabel: "お支払いが未完了です",
    headline: "支払い情報の更新で利用を再開できます",
    detail: "停止中でも安全情報は閲覧できます。再開後に編集・通知・共有が復帰します。",
    ctaLabel: "契約を管理する",
    ctaAction: "portal"
  },
  GRACE: {
    badgeLabel: "猶予中",
    statusLabel: "一部機能が制限されています",
    headline: "支払い情報の更新で全機能が復帰します",
    detail: "猶予中でも安全情報は閲覧できます。契約管理からいつでも再開できます。",
    ctaLabel: "契約を管理する",
    ctaAction: "portal"
  }
};

const DEFAULT_BILLING_COPY: BillingActionCopy = BILLING_ACTION_COPY.INCOMPLETE;

const formatBillingDate = (iso: string | null) => (iso ? new Date(iso).toLocaleString("ja-JP") : "-");

interface ClientSettingsProps {
  initialHouseholdName: string;
  initialMembers: Member[];
  initialCurrentUserRole: "OWNER" | "FAMILY";
  initialAccount: AccountPayload;
  initialBilling: BillingPayload;
  initialPets: PetListItem[];
  initialOwnerDisplaySettings: OwnerDisplaySettings | null;
  initialOwnerProfile: OwnerProfile | null;
}

export function ClientSettings({
  initialHouseholdName,
  initialMembers,
  initialCurrentUserRole,
  initialAccount,
  initialBilling,
  initialPets,
  initialOwnerDisplaySettings,
  initialOwnerProfile
}: ClientSettingsProps) {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [householdName, setHouseholdName] = useState<string>(initialHouseholdName);
  const [currentUserRole, setCurrentUserRole] = useState<"OWNER" | "FAMILY">(initialCurrentUserRole);
  const [account, setAccount] = useState<AccountPayload>(initialAccount);
  const [displayName, setDisplayName] = useState(initialAccount.displayName ?? "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [billing, setBilling] = useState<BillingPayload>(initialBilling);
  const [isBillingSubmitting, setIsBillingSubmitting] = useState(false);
  const [isPortalSubmitting, setIsPortalSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("monthly");
  const [annualPlanAvailable, setAnnualPlanAvailable] = useState(false);
  const [pets, setPets] = useState<PetListItem[]>(initialPets);
  const [ownerDisplaySettings, setOwnerDisplaySettings] = useState<OwnerDisplaySettings | null>(initialOwnerDisplaySettings);
  const [isDisplaySettingsSaving, setIsDisplaySettingsSaving] = useState(false);
  const [isRecoveringOwner, setIsRecoveringOwner] = useState(false);
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile | null>(initialOwnerProfile);
  const [isOwnerProfileSaving, setIsOwnerProfileSaving] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);

  const isOwner = currentUserRole === "OWNER";
  const hasOwner = members.some((member) => member.role === "OWNER");
  const oldestMember = [...members].sort((a, b) => {
    const createdAtDiff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (createdAtDiff !== 0) {
      return createdAtDiff;
    }
    return a.id.localeCompare(b.id);
  })[0];
  const canRecoverOwner = !hasOwner && !!account?.userId && oldestMember?.userId === account.userId;

  const loadData = async () => {
    setErrorMessage(null);
    try {
      const [membersRes, accountRes, billingRes, petsRes, ownerSettingsRes] = await Promise.all([
        fetch("/api/households/members"),
        fetch("/api/account"),
        fetch("/api/billing/subscription"),
        fetch("/api/pets"),
        fetch("/api/settings/display")
      ]);

      if (!membersRes.ok || !accountRes.ok || !billingRes.ok || !petsRes.ok || !ownerSettingsRes.ok) {
        setErrorMessage("設定情報の取得に失敗しました。");
        return;
      }

      const membersJson = (await membersRes.json()) as { data: { household: { name: string; members: Member[] }; currentUserRole: "OWNER" | "FAMILY" } };
      const accountJson = (await accountRes.json()) as { data: AccountPayload };
      const billingJson = (await billingRes.json()) as { data: BillingPayload };
      const petsJson = (await petsRes.json()) as { data: PetListItem[] };
      const ownerSettingsJson = (await ownerSettingsRes.json()) as { data: OwnerDisplaySettings };
      const ownerProfileRes = await fetch("/api/settings/owner-profile");
      const ownerProfileJson = ownerProfileRes.ok
        ? ((await ownerProfileRes.json()) as { data: OwnerProfile })
        : null;

      setHouseholdName(membersJson.data.household.name);
      setMembers(membersJson.data.household.members);
      setCurrentUserRole(membersJson.data.currentUserRole);
      setAccount(accountJson.data);
      setDisplayName(accountJson.data.displayName ?? "");
      setBilling(billingJson.data);
      setPets(petsJson.data);
      setOwnerDisplaySettings(ownerSettingsJson.data);
      setOwnerProfile(ownerProfileJson?.data ?? null);
      
      // Check if annual plan is available
      try {
        const testResponse = await fetch("/api/billing/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: "annual" })
        });
        setAnnualPlanAvailable(testResponse.ok);
      } catch {
        setAnnualPlanAvailable(false);
      }
    } catch {
      setErrorMessage("設定情報の取得に失敗しました。");
    }
  };

  const roleLabel = useMemo(() => ({ OWNER: "OWNER", FAMILY: "FAMILY" }), []);

  const handleRoleChange = async (memberId: string, nextRole: "OWNER" | "FAMILY") => {
    setErrorMessage(null);
    setMessage(null);

    const response = await fetch(`/api/households/members/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole })
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setErrorMessage(typeof payload?.error === "string" ? payload.error : "権限更新に失敗しました。");
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

    const response = await fetch("/api/billing/checkout", { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: selectedPlan })
    });
    const payload = (await response.json().catch(() => null)) as { data?: { url?: string }; error?: string } | null;

    if (!response.ok || !payload?.data?.url) {
      setIsBillingSubmitting(false);
      setErrorMessage(typeof payload?.error === "string" ? payload.error : "課金ページの作成に失敗しました。");
      return;
    }

    window.location.href = payload.data.url;
  };

  const handleOpenBillingPortal = async () => {
    setErrorMessage(null);
    setIsPortalSubmitting(true);

    const response = await fetch("/api/billing/portal", { method: "POST" });
    const payload = (await response.json().catch(() => null)) as { data?: { url?: string }; error?: string } | null;

    if (!response.ok || !payload?.data?.url) {
      setIsPortalSubmitting(false);
      setErrorMessage(
        typeof payload?.error === "string"
          ? payload.error
          : "契約管理ページを開けませんでした。時間をおいて再度お試しください。"
      );
      return;
    }

    window.location.href = payload.data.url;
  };

  const handleToggleDisplaySetting = async (
    key: keyof Omit<OwnerDisplaySettings, "ownerUserId">,
    checked: boolean
  ) => {
    setErrorMessage(null);
    setMessage(null);
    setIsDisplaySettingsSaving(true);

    const response = await fetch("/api/settings/display", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: checked })
    });
    const payload = (await response.json().catch(() => null)) as { data?: OwnerDisplaySettings; error?: string } | null;

    if (!response.ok || !payload?.data) {
      setErrorMessage("表示設定の更新に失敗しました。");
      setIsDisplaySettingsSaving(false);
      return;
    }

    setOwnerDisplaySettings(payload.data as OwnerDisplaySettings);
    setIsDisplaySettingsSaving(false);
    setMessage("表示設定を更新しました。");
  };

  const handleRecoverOwner = async () => {
    setErrorMessage(null);
    setMessage(null);
    setIsRecoveringOwner(true);

    const response = await fetch("/api/households/recover-owner", { method: "POST" });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setErrorMessage(typeof payload?.error === "string" ? payload.error : "OWNER復旧に失敗しました。");
      setIsRecoveringOwner(false);
      return;
    }

    setIsRecoveringOwner(false);
    setMessage("OWNERを復旧しました。");
    await loadData();
  };

  const handleOwnerProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ownerProfile) {
      return;
    }

    setErrorMessage(null);
    setMessage(null);
    setIsOwnerProfileSaving(true);

    const response = await fetch("/api/settings/owner-profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: ownerProfile.fullName,
        phone: ownerProfile.phone,
        email: ownerProfile.email,
        postalCode: ownerProfile.postalCode,
        addressLine1: ownerProfile.addressLine1,
        addressLine2: ownerProfile.addressLine2,
        note: ownerProfile.note
      })
    });
    const payload = (await response.json().catch(() => null)) as { data?: OwnerProfile; error?: string } | null;

    if (!response.ok || !payload?.data) {
      setErrorMessage(typeof payload?.error === "string" ? payload.error : "飼い主情報の更新に失敗しました。");
      setIsOwnerProfileSaving(false);
      return;
    }

    setOwnerProfile(payload.data);
    setIsOwnerProfileSaving(false);
    setMessage("飼い主情報を更新しました。");
  };

  const handleDeleteAccount = async () => {
    setShowDeleteAccountDialog(true);
  };

  const handleDeleteAccountConfirm = async () => {
    setShowDeleteAccountDialog(false);
    setErrorMessage(null);
    setMessage(null);
    setIsDeletingAccount(true);

    const response = await fetch("/api/account", { method: "DELETE" });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setIsDeletingAccount(false);
      setErrorMessage(typeof payload?.error === "string" ? payload.error : "アカウント削除に失敗しました。");
      return;
    }

    setIsDeletingAccount(false);
    setMessage("アカウントを削除しました。");
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {message && <ToastMessage message={message} type="success" />}
      {errorMessage && <ToastMessage message={errorMessage} type="error" />}

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
                      onClick={() => void handleRoleChange(member.id, "OWNER")}
                    >
                      OWNER
                    </button>
                    <button
                      type="button"
                      className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-800"
                      onClick={() => void handleRoleChange(member.id, "FAMILY")}
                    >
                      FAMILY
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        {canRecoverOwner ? (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs text-amber-800">世帯にOWNERがいないため、最古メンバーとして復旧できます。</p>
            <button
              type="button"
              className="mt-2 rounded bg-amber-700 px-3 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => void handleRecoverOwner()}
              disabled={isRecoveringOwner}
            >
              {isRecoveringOwner ? "復旧中..." : "OWNERを復旧する"}
            </button>
          </div>
        ) : null}
      </section>
      {isOwner ? <HouseholdInviteCodeCard /> : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">課金プラン</h2>
        <p className="mt-1 text-sm text-slate-600">
          {annualPlanAvailable 
            ? "30日無料トライアル、その後月額680円または年額7,800円（Stripe定期課金）"
            : "30日無料トライアル、その後月額680円（Stripe定期課金）"
          }
        </p>
        
        {billing?.subscriptionStatus === "INCOMPLETE" && annualPlanAvailable && (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div 
              className={`rounded-xl border-2 p-4 cursor-pointer transition ${
                selectedPlan === "monthly" 
                  ? "border-emerald-500 bg-emerald-50" 
                  : "border-slate-200 bg-slate-50 hover:border-slate-300"
              }`}
              onClick={() => setSelectedPlan("monthly")}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">月払い</h3>
                <span className="text-2xl font-bold text-slate-900">¥680<span className="text-sm font-normal text-slate-600">/月</span></span>
              </div>
              <p className="mt-2 text-sm text-slate-600">月額コースで柔軟に利用</p>
            </div>
            
            <div 
              className={`rounded-xl border-2 p-4 cursor-pointer transition ${
                selectedPlan === "annual" 
                  ? "border-emerald-500 bg-emerald-50" 
                  : "border-slate-200 bg-slate-50 hover:border-slate-300"
              }`}
              onClick={() => setSelectedPlan("annual")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">年払い</h3>
                  <span className="inline-flex rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white mt-1">4%お得</span>
                </div>
                <span className="text-2xl font-bold text-slate-900">¥7,800<span className="text-sm font-normal text-slate-600">/年</span></span>
              </div>
              <p className="mt-2 text-sm text-slate-600">年額7,800円（¥650/月相当）</p>
            </div>
          </div>
        )}
        
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-slate-900 px-2 py-1 text-xs font-semibold text-white">
              {(billing ? BILLING_ACTION_COPY[billing.subscriptionStatus] : DEFAULT_BILLING_COPY).badgeLabel}
            </span>
            <p className="text-xs font-medium text-slate-700">
              {(billing ? BILLING_ACTION_COPY[billing.subscriptionStatus] : DEFAULT_BILLING_COPY).statusLabel}
            </p>
          </div>
          <p className="mt-3 text-base font-bold text-slate-900">
            {(billing ? BILLING_ACTION_COPY[billing.subscriptionStatus] : DEFAULT_BILLING_COPY).headline}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {(billing ? BILLING_ACTION_COPY[billing.subscriptionStatus] : DEFAULT_BILLING_COPY).detail}
          </p>
          <p className="mt-3 text-xs text-slate-500">失効時も安全情報は閲覧できます。再開で全機能が復帰します。</p>
          <div className="mt-3">
            <button
              type="button"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => {
                const action = (billing ? BILLING_ACTION_COPY[billing.subscriptionStatus] : DEFAULT_BILLING_COPY).ctaAction;
                if (action === "portal") {
                  void handleOpenBillingPortal();
                  return;
                }
                void handleStartBilling();
              }}
              disabled={isBillingSubmitting || isPortalSubmitting}
            >
              {isBillingSubmitting || isPortalSubmitting
                ? "遷移中..."
                : (billing ? BILLING_ACTION_COPY[billing.subscriptionStatus] : DEFAULT_BILLING_COPY).ctaLabel}
            </button>
          </div>
        </div>
        <div className="mt-3 rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-600">
            トライアル終了: <span className="font-medium text-slate-800">{formatBillingDate(billing?.trialEndsAt ?? null)}</span>
          </p>
          <p className="mt-1 text-xs text-slate-600">
            次回更新日: <span className="font-medium text-slate-800">{formatBillingDate(billing?.currentPeriodEnd ?? null)}</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">システム状態コード: {billing?.subscriptionStatus ?? "INCOMPLETE"}</p>
        </div>
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

      <section className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
        <h2 className="text-lg font-bold text-red-900">アカウント削除（退会）</h2>
        <p className="mt-1 text-sm text-red-700">
          アカウントを削除すると、全てのデータが完全に消去されます。この操作は取り消せません。
        </p>
        <button
          className="mt-3 rounded-lg border border-red-300 bg-red-100 px-4 py-2 text-sm font-semibold text-red-800 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => void handleDeleteAccount()}
          disabled={isDeletingAccount}
        >
          {isDeletingAccount ? "削除中..." : "アカウントを削除する"}
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">飼い主情報</h2>
        <p className="mt-1 text-sm text-slate-600">世帯OWNERの連絡先情報を管理します。</p>
        {ownerProfile ? (
          <form className="mt-3 space-y-3" onSubmit={handleOwnerProfileSubmit}>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">氏名</label>
              <input
                value={ownerProfile.fullName ?? ""}
                onChange={(event) => setOwnerProfile({ ...ownerProfile, fullName: event.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="山田 花子"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">電話番号</label>
              <input
                value={ownerProfile.phone ?? ""}
                onChange={(event) => setOwnerProfile({ ...ownerProfile, phone: event.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="090-1234-5678"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">メール</label>
              <input
                value={ownerProfile.email ?? ""}
                onChange={(event) => setOwnerProfile({ ...ownerProfile, email: event.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="owner@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">郵便番号</label>
              <input
                value={ownerProfile.postalCode ?? ""}
                onChange={(event) => setOwnerProfile({ ...ownerProfile, postalCode: event.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="123-4567"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">住所1</label>
              <input
                value={ownerProfile.addressLine1 ?? ""}
                onChange={(event) => setOwnerProfile({ ...ownerProfile, addressLine1: event.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="東京都渋谷区..."
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">住所2</label>
              <input
                value={ownerProfile.addressLine2 ?? ""}
                onChange={(event) => setOwnerProfile({ ...ownerProfile, addressLine2: event.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="建物名・部屋番号"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">備考</label>
              <textarea
                value={ownerProfile.note ?? ""}
                onChange={(event) => setOwnerProfile({ ...ownerProfile, note: event.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="任意の備考"
                rows={3}
              />
            </div>
            <button
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isOwnerProfileSaving}
            >
              {isOwnerProfileSaving ? "保存中..." : "保存する"}
            </button>
          </form>
        ) : (
          <p className="mt-3 text-sm text-slate-600">飼い主情報が登録されていません。</p>
        )}
      </section>

      {isOwner && ownerDisplaySettings ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">表示設定</h2>
          <p className="mt-1 text-sm text-slate-600">ペット詳細ページの表示項目を制御します。</p>
          <div className="mt-3 space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={ownerDisplaySettings.showMedicationCard}
                onChange={(event) => void handleToggleDisplaySetting("showMedicationCard", event.target.checked)}
                disabled={isDisplaySettingsSaving}
                className="rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">投薬カードを表示</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={ownerDisplaySettings.showVaccinationCard}
                onChange={(event) => void handleToggleDisplaySetting("showVaccinationCard", event.target.checked)}
                disabled={isDisplaySettingsSaving}
                className="rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">ワクチンカードを表示</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={ownerDisplaySettings.showHealthCard}
                onChange={(event) => void handleToggleDisplaySetting("showHealthCard", event.target.checked)}
                disabled={isDisplaySettingsSaving}
                className="rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">健康記録カードを表示</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={ownerDisplaySettings.showMedicalRecordCard}
                onChange={(event) => void handleToggleDisplaySetting("showMedicalRecordCard", event.target.checked)}
                disabled={isDisplaySettingsSaving}
                className="rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">医療記録カードを表示</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={ownerDisplaySettings.showEmergencyMedicationSummary}
                onChange={(event) => void handleToggleDisplaySetting("showEmergencyMedicationSummary", event.target.checked)}
                disabled={isDisplaySettingsSaving}
                className="rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">緊急画面：投薬サマリーを表示</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={ownerDisplaySettings.showEmergencyVaccinationSummary}
                onChange={(event) => void handleToggleDisplaySetting("showEmergencyVaccinationSummary", event.target.checked)}
                disabled={isDisplaySettingsSaving}
                className="rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">緊急画面：ワクチンサマリーを表示</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={ownerDisplaySettings.showEmergencyMedicalRecordSummary}
                onChange={(event) => void handleToggleDisplaySetting("showEmergencyMedicalRecordSummary", event.target.checked)}
                disabled={isDisplaySettingsSaving}
                className="rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">緊急画面：医療記録サマリーを表示</span>
            </label>
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">ログアウト</h2>
        <p className="mt-1 text-sm text-slate-600">現在のセッションを終了します。</p>
        <button
          className="mt-3 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800"
          onClick={() => void handleLogout()}
        >
          ログアウト
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">法務ドキュメント</h2>
        <p className="mt-1 text-sm text-slate-600">サービス利用に関する法務情報</p>
        <div className="mt-3 flex flex-wrap gap-4">
          <Link href="/legal/terms" className="text-sm text-slate-600 hover:text-slate-900 hover:underline">
            利用規約
          </Link>
          <Link href="/legal/privacy" className="text-sm text-slate-600 hover:text-slate-900 hover:underline">
            プライバシーポリシー
          </Link>
          <Link href="/legal/commercial" className="text-sm text-slate-600 hover:text-slate-900 hover:underline">
            特定商取引法表記
          </Link>
          <Link href="/legal/cookie" className="text-sm text-slate-600 hover:text-slate-900 hover:underline">
            Cookieポリシー
          </Link>
        </div>
      </section>

      <ConfirmDialog
        isOpen={showDeleteAccountDialog}
        title="アカウントを削除"
        message="アカウントを削除すると、以下のデータが完全に消去されます：\n・全てのペット情報\n・全ての医療記録\n・全ての写真\n・世帯情報\n・サブスクリプション（即時キャンセル）\n\nこの操作は取り消せません。本当に削除しますか？"
        confirmLabel="削除"
        cancelLabel="キャンセル"
        variant="danger"
        onConfirm={handleDeleteAccountConfirm}
        onCancel={() => setShowDeleteAccountDialog(false)}
      />
    </div>
  );
}