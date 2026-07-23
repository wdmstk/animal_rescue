"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MedicationCalendar } from "@/components/features/pets/medication-calendar";
import { SubmitButton } from "@/components/ui/submit-button";

type MedicationItem = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string | null;
};

type MedicationManagerCardProps = {
  petId: string;
  initialItems: MedicationItem[];
};

const normalizeDate = (value: string) => value.slice(0, 10);

function MedicationLogView({
  petId,
  medicationId,
  refreshTrigger
}: {
  petId: string;
  medicationId: string;
  refreshTrigger: number;
}) {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchLogs = async () => {
      try {
        const response = await fetch(`/api/pets/${petId}/medications/${medicationId}/logs`);
        if (response.ok && isMounted) {
          const payload = await response.json();
          setLogs(payload.data || []);
        }
      } catch {
        // noop
      }
    };
    void fetchLogs();
    return () => {
      isMounted = false;
    };
  }, [petId, medicationId, refreshTrigger]);

  if (logs.length === 0) return null;

  return (
    <div className="mt-2 border-t border-slate-100 pt-1.5 text-xs">
      <span className="font-semibold text-slate-500">最近の記録: </span>
      <div className="mt-1 flex flex-wrap gap-1">
        {logs.slice(0, 3).map((log) => (
          <span
            key={log.id}
            className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
              log.status === "TAKEN"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            {log.status === "TAKEN" ? "飲んだ" : "スキップ"} (
            {new Date(log.loggedAt).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })})
          </span>
        ))}
      </div>
    </div>
  );
}

export function MedicationManagerCard({ petId, initialItems }: MedicationManagerCardProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderChannel, setReminderChannel] = useState<"email" | "line" | "webhook">("email");
  const [reminderDestination, setReminderDestination] = useState("");
  const [isReminderSaving, setIsReminderSaving] = useState(false);
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newFrequency, setNewFrequency] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");

  const [editName, setEditName] = useState("");
  const [editDosage, setEditDosage] = useState("");
  const [editFrequency, setEditFrequency] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");

  const [refreshLogsTrigger, setRefreshLogsTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadReminderSettings = async () => {
      try {
        const response = await fetch(`/api/pets/${petId}/medication-reminders`, { cache: "no-store" });
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

  const startEdit = (item: MedicationItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditDosage(item.dosage);
    setEditFrequency(item.frequency);
    setEditStartDate(normalizeDate(item.startDate));
    setEditEndDate(item.endDate ? normalizeDate(item.endDate) : "");
    setErrorMessage(null);
  };

  const onCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/pets/${petId}/medications`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: newName,
          dosage: newDosage,
          frequency: newFrequency,
          startDate: newStartDate,
          endDate: newEndDate.trim().length > 0 ? newEndDate : null
        })
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setErrorMessage("投薬の追加に失敗しました。入力内容を確認してください。");
        return;
      }

      setNewName("");
      setNewDosage("");
      setNewFrequency("");
      setNewStartDate("");
      setNewEndDate("");
      router.refresh();
    } catch {
      setErrorMessage("通信エラーが発生しました。時間をおいて再度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/pets/${petId}/medications/${editingId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: editName,
          dosage: editDosage,
          frequency: editFrequency,
          startDate: editStartDate,
          endDate: editEndDate.trim().length > 0 ? editEndDate : null
        })
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setErrorMessage("投薬の更新に失敗しました。入力内容を確認してください。");
        return;
      }

      setEditingId(null);
      router.refresh();
    } catch {
      setErrorMessage("通信エラーが発生しました。時間をおいて再度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogMedication = async (medicationId: string, status: "TAKEN" | "SKIPPED") => {
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/pets/${petId}/medications/${medicationId}/logs`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        throw new Error("failed");
      }
      setRefreshLogsTrigger((prev) => prev + 1);
    } catch {
      setErrorMessage("投薬状況の記録に失敗しました。");
    }
  };

  const onSaveReminderSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setReminderMessage(null);
    setIsReminderSaving(true);

    try {
      const response = await fetch(`/api/pets/${petId}/medication-reminders`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          enabled: reminderEnabled,
          channel: reminderChannel,
          destination: reminderDestination
        })
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setErrorMessage("通知設定の保存に失敗しました。入力内容を確認してください。");
        return;
      }

      setReminderMessage("通知設定を保存しました。");
      router.refresh();
    } catch {
      setErrorMessage("通信エラーが発生しました。時間をおいて再度お試しください。");
    } finally {
      setIsReminderSaving(false);
    }
  };

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md text-white">
      <MedicationCalendar
        periods={initialItems.map((item) => ({
          name: item.name,
          startDate: normalizeDate(item.startDate),
          endDate: item.endDate ? normalizeDate(item.endDate) : null
        }))}
      />

      <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
        <h3 className="text-base font-bold text-teal-300 flex items-center gap-2">💊 投薬一覧・実施記録</h3>
        <div className="mt-3 space-y-3">
          {initialItems.length === 0 ? <p className="text-xs text-slate-400">登録済みの投薬はありません。</p> : null}
          {initialItems.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-white/10 bg-slate-900/60 p-3.5 text-xs text-slate-200"
            >
              <div className="flex justify-between items-start">
                <div onClick={() => startEdit(item)} className="cursor-pointer flex-grow space-y-0.5">
                  <p className="font-bold text-white text-sm hover:text-teal-300 transition-all">{item.name}</p>
                  <p className="text-slate-300 font-medium">{item.dosage} / {item.frequency}</p>
                  <p className="text-xs text-slate-400">
                    {normalizeDate(item.startDate)} - {item.endDate ? normalizeDate(item.endDate) : "継続中"}
                  </p>
                </div>
                <div className="flex gap-1.5 ml-2">
                  <button
                    type="button"
                    onClick={() => handleLogMedication(item.id, "TAKEN")}
                    className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-500 active:scale-95 transition-all shadow"
                  >
                    飲んだ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLogMedication(item.id, "SKIPPED")}
                    className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-rose-500 active:scale-95 transition-all shadow"
                  >
                    スキップ
                  </button>
                </div>
              </div>
              <MedicationLogView petId={petId} medicationId={item.id} refreshTrigger={refreshLogsTrigger} />
            </div>
          ))}
        </div>
      </div>

      {editingId ? (
        <form className="rounded-xl border border-white/10 bg-slate-950/40 p-4 space-y-3" onSubmit={onUpdate}>
          <h3 className="text-sm font-bold text-amber-300">✏️ 投薬を編集</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <label htmlFor="edit-name" className="sr-only">薬名</label>
            <input id="edit-name" required value={editName} onChange={(event) => setEditName(event.target.value)} placeholder="薬名" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none" />
            <label htmlFor="edit-dosage" className="sr-only">用量</label>
            <input id="edit-dosage" required value={editDosage} onChange={(event) => setEditDosage(event.target.value)} placeholder="用量" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none" />
            <label htmlFor="edit-frequency" className="sr-only">頻度</label>
            <input id="edit-frequency" required value={editFrequency} onChange={(event) => setEditFrequency(event.target.value)} placeholder="頻度" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none" />
            <label htmlFor="edit-start-date" className="sr-only">開始日</label>
            <input id="edit-start-date" required type="date" value={editStartDate} onChange={(event) => setEditStartDate(event.target.value)} className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none" />
            <label htmlFor="edit-end-date" className="sr-only">終了日</label>
            <input id="edit-end-date" type="date" value={editEndDate} onChange={(event) => setEditEndDate(event.target.value)} className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none sm:col-span-2" />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button type="button" onClick={() => setEditingId(null)} className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700">キャンセル</button>
            <SubmitButton isSubmitting={isSubmitting} idleLabel="更新する" className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 text-xs font-bold text-white" />
          </div>
        </form>
      ) : null}

      <form className="rounded-xl border border-white/10 bg-slate-950/40 p-4 space-y-3" onSubmit={onCreate}>
        <h3 className="text-sm font-bold text-teal-300">➕ 投薬を追加</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <label htmlFor="new-name" className="sr-only">薬名</label>
          <input id="new-name" required value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="薬名 (例: アモキシシリン)" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none" />
          <label htmlFor="new-dosage" className="sr-only">用量</label>
          <input id="new-dosage" required value={newDosage} onChange={(event) => setNewDosage(event.target.value)} placeholder="用量 (例: 1錠)" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none" />
          <label htmlFor="new-frequency" className="sr-only">頻度</label>
          <input id="new-frequency" required value={newFrequency} onChange={(event) => setNewFrequency(event.target.value)} placeholder="頻度 (例: 1日2回 朝夕食後)" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none" />
          <label htmlFor="new-start-date" className="sr-only">開始日</label>
          <input id="new-start-date" required type="date" value={newStartDate} onChange={(event) => setNewStartDate(event.target.value)} className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none" />
          <label htmlFor="new-end-date" className="sr-only">終了日</label>
          <input id="new-end-date" type="date" value={newEndDate} onChange={(event) => setNewEndDate(event.target.value)} className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none sm:col-span-2" />
        </div>
        <SubmitButton isSubmitting={isSubmitting} idleLabel="追加する" className="mt-2 w-full rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 py-2.5 text-xs font-bold text-white shadow" />
      </form>

      <form className="rounded-xl border border-white/10 bg-slate-950/40 p-4 space-y-3" onSubmit={onSaveReminderSettings}>
        <div>
          <h3 className="text-sm font-bold text-blue-300">🔔 投薬リマインダー通知設定</h3>
          <p className="mt-0.5 text-xs text-slate-400">指定チャネルへ飲み忘れ防止リマインダーを通知します。</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 text-xs">
          <label className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-slate-200 sm:col-span-2 cursor-pointer">
            <span className="font-semibold">通知を有効化する</span>
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={(event) => setReminderEnabled(event.target.checked)}
              disabled={isReminderSaving}
              className="rounded border-slate-700 text-teal-500 focus:ring-teal-500"
            />
          </label>
          <select
            value={reminderChannel}
            onChange={(event) => setReminderChannel(event.target.value as "email" | "line" | "webhook")}
            disabled={isReminderSaving}
            className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white"
          >
            <option value="email">メール (email)</option>
            <option value="line">LINE Notify</option>
            <option value="webhook">Webhook URL</option>
          </select>
          <input
            required={reminderEnabled}
            value={reminderDestination}
            onChange={(event) => setReminderDestination(event.target.value)}
            placeholder={reminderChannel === "webhook" ? "https://example.com/hooks/reminder" : "送信先ID / メール"}
            disabled={isReminderSaving}
            className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500"
          />
        </div>
        <SubmitButton isSubmitting={isReminderSaving} idleLabel="通知設定を保存" className="mt-2 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 py-2.5 text-xs font-bold text-white shadow" />
        {reminderMessage ? <p className="mt-2 text-xs text-emerald-400 font-semibold">{reminderMessage}</p> : null}
      </form>

      {errorMessage ? <p className="text-xs text-rose-400 font-semibold">{errorMessage}</p> : null}
    </section>
  );
}
