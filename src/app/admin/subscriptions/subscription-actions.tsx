"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

type SubscriptionStatus =
  | "INCOMPLETE"
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "UNPAID";

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  INCOMPLETE: "INCOMPLETE",
  TRIALING: "TRIALING",
  ACTIVE: "ACTIVE",
  PAST_DUE: "PAST_DUE",
  CANCELED: "CANCELED",
  UNPAID: "UNPAID"
};

const STATUS_COLORS: Record<SubscriptionStatus, string> = {
  INCOMPLETE: "bg-yellow-100 text-yellow-700",
  TRIALING: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-green-100 text-green-700",
  PAST_DUE: "bg-orange-100 text-orange-700",
  CANCELED: "bg-slate-100 text-slate-600",
  UNPAID: "bg-red-100 text-red-700"
};

export function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${STATUS_COLORS[status] ?? "bg-slate-100 text-slate-600"}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function StatusChangeSelect({
  userId,
  currentStatus
}: {
  userId: string;
  currentStatus: SubscriptionStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    if (!confirm(`ステータスを ${currentStatus} → ${newStatus} に変更しますか？`)) return;

    const res = await fetch(`/api/admin/subscriptions/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });

    if (!res.ok) {
      alert("変更に失敗しました");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <select
      defaultValue={currentStatus}
      disabled={isPending}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
    >
      {Object.keys(STATUS_LABELS).map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

export function ExtendTrialButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleExtend = async (days: number) => {
    const newDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    if (!confirm(`トライアルを ${days} 日延長しますか？（${newDate.toLocaleDateString("ja-JP")} まで）`))
      return;

    const res = await fetch(`/api/admin/subscriptions/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trialEndsAt: newDate.toISOString(), status: "TRIALING" })
    });

    if (!res.ok) {
      alert("延長に失敗しました");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <span className="flex gap-1">
      <button
        onClick={() => handleExtend(7)}
        disabled={isPending}
        className="rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
      >
        +7日
      </button>
      <button
        onClick={() => handleExtend(30)}
        disabled={isPending}
        className="rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
      >
        +30日
      </button>
    </span>
  );
}
