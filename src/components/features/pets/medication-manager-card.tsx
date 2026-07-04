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
    <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
      <MedicationCalendar
        periods={initialItems.map((item) => ({
          name: item.name,
          startDate: normalizeDate(item.startDate),
          endDate: item.endDate ? normalizeDate(item.endDate) : null
        }))}
      />

      <div className="rounded-lg border border-slate-200 p-3">
        <h3 className="text-sm font-bold text-slate-900">投薬一覧・編集</h3>
        <div className="mt-2 space-y-2">
          {initialItems.length === 0 ? <p className="text-sm text-slate-600">登録済みの投薬はありません。</p> : null}
          {initialItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => startEdit(item)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-sm"
            >
              <p className="font-semibold text-slate-800">{item.name}</p>
              <p className="text-slate-600">{item.dosage} / {item.frequency}</p>
              <p className="text-xs text-slate-500">
                {normalizeDate(item.startDate)} - {item.endDate ? normalizeDate(item.endDate) : "継続中"}
              </p>
            </button>
          ))}
        </div>
      </div>

      {editingId ? (
        <form className="rounded-lg border border-slate-200 p-3" onSubmit={onUpdate}>
          <h3 className="text-sm font-bold text-slate-900">投薬を編集</h3>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            <label htmlFor="edit-name" className="sr-only">薬名</label>
            <input id="edit-name" required value={editName} onChange={(event) => setEditName(event.target.value)} placeholder="薬名" className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
            <label htmlFor="edit-dosage" className="sr-only">用量</label>
            <input id="edit-dosage" required value={editDosage} onChange={(event) => setEditDosage(event.target.value)} placeholder="用量" className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
            <label htmlFor="edit-frequency" className="sr-only">頻度</label>
            <input id="edit-frequency" required value={editFrequency} onChange={(event) => setEditFrequency(event.target.value)} placeholder="頻度" className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
            <label htmlFor="edit-start-date" className="sr-only">開始日</label>
            <input id="edit-start-date" required type="date" value={editStartDate} onChange={(event) => setEditStartDate(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
            <label htmlFor="edit-end-date" className="sr-only">終了日</label>
            <input id="edit-end-date" type="date" value={editEndDate} onChange={(event) => setEditEndDate(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent md:col-span-2" />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setEditingId(null)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800">キャンセル</button>
            <SubmitButton isSubmitting={isSubmitting} idleLabel="更新する" />
          </div>
        </form>
      ) : null}

      <form className="rounded-lg border border-slate-200 p-3" onSubmit={onCreate}>
        <h3 className="text-sm font-bold text-slate-900">投薬を追加</h3>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          <label htmlFor="new-name" className="sr-only">薬名</label>
          <input id="new-name" required value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="薬名" className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
          <label htmlFor="new-dosage" className="sr-only">用量</label>
          <input id="new-dosage" required value={newDosage} onChange={(event) => setNewDosage(event.target.value)} placeholder="用量" className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
          <label htmlFor="new-frequency" className="sr-only">頻度</label>
          <input id="new-frequency" required value={newFrequency} onChange={(event) => setNewFrequency(event.target.value)} placeholder="頻度" className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
          <label htmlFor="new-start-date" className="sr-only">開始日</label>
          <input id="new-start-date" required type="date" value={newStartDate} onChange={(event) => setNewStartDate(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
          <label htmlFor="new-end-date" className="sr-only">終了日</label>
          <input id="new-end-date" type="date" value={newEndDate} onChange={(event) => setNewEndDate(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent md:col-span-2" />
        </div>
        <SubmitButton isSubmitting={isSubmitting} idleLabel="追加する" className="mt-2 w-full" />
      </form>

      <form className="rounded-lg border border-slate-200 p-3" onSubmit={onSaveReminderSettings}>
        <h3 className="text-sm font-bold text-slate-900">投薬リマインダー通知設定</h3>
        <p className="mt-1 text-xs text-slate-600">通知ON/OFFと送信先を保存できます。</p>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          <label className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2">
            <span>通知を有効化する</span>
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={(event) => setReminderEnabled(event.target.checked)}
              disabled={isReminderSaving}
            />
          </label>
          <select
            value={reminderChannel}
            onChange={(event) => setReminderChannel(event.target.value as "email" | "line" | "webhook")}
            disabled={isReminderSaving}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="email">email</option>
            <option value="line">line</option>
            <option value="webhook">webhook</option>
          </select>
          <input
            required={reminderEnabled}
            value={reminderDestination}
            onChange={(event) => setReminderDestination(event.target.value)}
            placeholder={reminderChannel === "webhook" ? "https://example.com/hooks/reminder" : "送信先ID / メール"}
            disabled={isReminderSaving}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <SubmitButton isSubmitting={isReminderSaving} idleLabel="通知設定を保存" className="mt-2 w-full" />
        {reminderMessage ? <p className="mt-2 text-xs text-emerald-700">{reminderMessage}</p> : null}
      </form>

      {errorMessage ? <p className="text-sm text-rose-700">{errorMessage}</p> : null}
    </section>
  );
}
