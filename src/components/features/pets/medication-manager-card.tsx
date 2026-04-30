"use client";

import { FormEvent, useState } from "react";
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
            <input required value={editName} onChange={(event) => setEditName(event.target.value)} placeholder="薬名" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input required value={editDosage} onChange={(event) => setEditDosage(event.target.value)} placeholder="用量" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input required value={editFrequency} onChange={(event) => setEditFrequency(event.target.value)} placeholder="頻度" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input required type="date" value={editStartDate} onChange={(event) => setEditStartDate(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input type="date" value={editEndDate} onChange={(event) => setEditEndDate(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2" />
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
          <input required value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="薬名" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input required value={newDosage} onChange={(event) => setNewDosage(event.target.value)} placeholder="用量" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input required value={newFrequency} onChange={(event) => setNewFrequency(event.target.value)} placeholder="頻度" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input required type="date" value={newStartDate} onChange={(event) => setNewStartDate(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input type="date" value={newEndDate} onChange={(event) => setNewEndDate(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2" />
        </div>
        <SubmitButton isSubmitting={isSubmitting} idleLabel="追加する" className="mt-2 w-full" />
      </form>

      {errorMessage ? <p className="text-sm text-rose-700">{errorMessage}</p> : null}
    </section>
  );
}
