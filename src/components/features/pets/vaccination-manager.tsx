"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { VaccinationHistory, type VaccinationHistoryItem } from "@/components/features/pets/vaccination-history";
import { SubmitButton } from "@/components/ui/submit-button";
import { ToastMessage } from "@/components/ui/toast-message";

type VaccinationType = "RABIES" | "CORE" | "HEARTWORM" | "FLEA_TICK" | "OTHER";

type VaccinationItem = VaccinationHistoryItem & {
  customTypeName: string | null;
};

type VaccinationManagerProps = {
  petId: string;
  initialItems: Array<
    Omit<VaccinationItem, "id" | "typeCode"> & {
      id?: string;
      typeCode?: VaccinationType;
    }
  >;
};

const today = new Date().toISOString().slice(0, 10);

const typeLabelMap: Record<VaccinationType, string> = {
  RABIES: "狂犬病",
  CORE: "混合ワクチン",
  HEARTWORM: "フィラリア",
  FLEA_TICK: "ノミ・ダニ",
  OTHER: "その他"
};

const labelTypeMap: Record<string, VaccinationType> = {
  狂犬病: "RABIES",
  混合ワクチン: "CORE",
  フィラリア: "HEARTWORM",
  "ノミ・ダニ": "FLEA_TICK",
  その他: "OTHER"
};

const normalizeDate = (value: string) => value.slice(0, 10);

export function VaccinationManager({ petId, initialItems }: VaccinationManagerProps) {
  const [items, setItems] = useState<VaccinationItem[]>(
    initialItems.map((item, index) => ({
      id: item.id ?? `local-${index + 1}`,
      type: item.type,
      typeCode: item.typeCode ?? labelTypeMap[item.type] ?? "OTHER",
      customTypeName: item.customTypeName ?? null,
      date: item.date,
      nextDue: item.nextDue
    }))
  );
  const [type, setType] = useState<VaccinationType>("CORE");
  const [date, setDate] = useState(today);
  const [nextDue, setNextDue] = useState("");
  const [customTypeName, setCustomTypeName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Vaccine reminder settings states
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderChannel, setReminderChannel] = useState<"email" | "line" | "webhook">("email");
  const [reminderDestination, setReminderDestination] = useState("");
  const [isReminderSaving, setIsReminderSaving] = useState(false);
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadReminderSettings = async () => {
      try {
        const response = await fetch(`/api/pets/${petId}/vaccine-reminders`, { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          data?: { enabled: boolean; channel: "email" | "line" | "webhook"; destination: string };
        };

        if (!isMounted || !payload.data) {
          return;
        }

        setReminderEnabled(payload.data.enabled);
        setReminderChannel(payload.data.channel);
        setReminderDestination(payload.data.destination);
      } catch {
        // noop
      }
    };

    void loadReminderSettings();
    return () => {
      isMounted = false;
    };
  }, [petId]);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => b.date.localeCompare(a.date)),
    [items]
  );

  const resetForm = () => {
    setType("CORE");
    setDate(today);
    setNextDue("");
    setCustomTypeName("");
    setEditingId(null);
  };

  const onEditStart = (item: VaccinationHistoryItem) => {
    const currentItem = items.find((candidate) => candidate.id === item.id);
    setEditingId(item.id);
    setType(item.typeCode);
    setDate(item.date);
    setNextDue(item.nextDue ?? "");
    setCustomTypeName(currentItem?.customTypeName ?? "");
    setError(null);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (type === "OTHER" && customTypeName.trim().length === 0) {
      setError("その他を選択した場合は名称を入力してください");
      return;
    }
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/pets/${petId}/vaccinations`, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId ?? undefined,
          type,
          customTypeName: type === "OTHER" ? customTypeName.trim() : null,
          date,
          nextDue: nextDue || null
        })
      });

      if (!response.ok) {
        throw new Error("failed");
      }

      const payload = (await response.json()) as {
        data: { id: string; type: VaccinationType; customTypeName: string | null; date: string; nextDue: string | null };
      };

      const normalizedItem: VaccinationItem = {
        id: payload.data.id,
        typeCode: payload.data.type,
        type: payload.data.type === "OTHER" ? payload.data.customTypeName ?? "その他" : typeLabelMap[payload.data.type],
        customTypeName: payload.data.customTypeName,
        date: normalizeDate(payload.data.date),
        nextDue: payload.data.nextDue ? normalizeDate(payload.data.nextDue) : null
      };

      if (editingId) {
        setItems((prev) => prev.map((item) => (item.id === editingId ? normalizedItem : item)));
      } else {
        setItems((prev) => [normalizedItem, ...prev]);
      }

      resetForm();
    } catch {
      setError(editingId ? "ワクチン履歴の更新に失敗しました" : "ワクチン履歴の追加に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  const onSaveReminderSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setReminderMessage(null);
    setIsReminderSaving(true);

    try {
      const response = await fetch(`/api/pets/${petId}/vaccine-reminders`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          enabled: reminderEnabled,
          channel: reminderChannel,
          destination: reminderDestination
        })
      });

      if (!response.ok) {
        setError("通知設定の保存に失敗しました。入力内容を確認してください。");
        return;
      }

      setReminderMessage("通知設定を保存しました。");
    } catch {
      setError("通信エラーが発生しました。時間をおいて再度お試しください。");
    } finally {
      setIsReminderSaving(false);
    }
  };

  return (
    <section className="space-y-3">
      <VaccinationHistory items={sortedItems} editingId={editingId} onEdit={onEditStart} />

      <form onSubmit={onSubmit} className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md text-white space-y-3">
        <h3 className="text-sm font-bold text-emerald-300">
          {editingId ? "✏️ ワクチン履歴を編集" : "➕ ワクチン履歴を追加"}
        </h3>
        <div className="grid gap-2 sm:grid-cols-3">
          <label htmlFor="vaccination-type" className="sr-only">ワクチン種類</label>
          <select
            id="vaccination-type"
            value={type}
            onChange={(event) => setType(event.target.value as VaccinationType)}
            className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
          >
            {Object.entries(typeLabelMap).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <label htmlFor="vaccination-date" className="sr-only">接種日</label>
          <input
            id="vaccination-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            required
          />
          <label htmlFor="vaccination-next-due" className="sr-only">次回予定日</label>
          <input
            id="vaccination-next-due"
            type="date"
            value={nextDue}
            onChange={(event) => setNextDue(event.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <p className="text-xs text-slate-400">接種日: 実際に接種した日 / 次回予定: 次回接種日（未定なら空欄可）</p>
        {type === "OTHER" && (
          <input
            type="text"
            value={customTypeName}
            onChange={(event) => setCustomTypeName(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-white placeholder-slate-500"
            placeholder="その他ワクチン名"
            required
          />
        )}
        <div className="flex items-center gap-2 pt-1">
          <SubmitButton
            isSubmitting={isSaving}
            idleLabel={editingId ? "変更を保存" : "履歴を保存"}
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-2 text-xs font-bold text-white shadow"
          />
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              disabled={isSaving}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-60"
            >
              キャンセル
            </button>
          )}
        </div>
        <div className="mt-2">
          <ToastMessage message={error} type="error" />
        </div>
      </form>

      <form className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md text-white space-y-3" onSubmit={onSaveReminderSettings}>
        <div>
          <h3 className="text-sm font-bold text-blue-300">🔔 ワクチン期限リマインダー通知設定</h3>
          <p className="mt-0.5 text-xs text-slate-400">次回のワクチン接種期限が近づいた際の通知設定を保存できます。</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 text-xs">
          <label className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-slate-200 sm:col-span-2 cursor-pointer">
            <span className="font-semibold">通知を有効化する</span>
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={(event) => setReminderEnabled(event.target.checked)}
              disabled={isReminderSaving}
              className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
            />
          </label>
          <select
            value={reminderChannel}
            onChange={(event) => setReminderChannel(event.target.value as "email" | "line" | "webhook")}
            disabled={isReminderSaving}
            className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-white"
          >
            <option value="email">メール (email)</option>
            <option value="line">LINE Notify</option>
            <option value="webhook">Webhook URL</option>
          </select>
          <input
            required={reminderEnabled}
            value={reminderDestination}
            onChange={(event) => setReminderDestination(event.target.value)}
            placeholder={reminderChannel === "webhook" ? "https://example.com/hooks/vaccine-reminder" : "送信先ID / メール"}
            disabled={isReminderSaving}
            className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-white placeholder-slate-500"
          />
        </div>
        <SubmitButton isSubmitting={isReminderSaving} idleLabel="通知設定を保存" className="mt-2 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 py-2.5 text-xs font-bold text-white shadow" />
        {reminderMessage ? <p className="mt-2 text-xs text-emerald-400 font-semibold">{reminderMessage}</p> : null}
      </form>
    </section>
  );
}
