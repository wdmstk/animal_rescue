"use client";

import { FormEvent, useMemo, useState } from "react";
import { MedicalTimeline } from "@/components/features/pets/medical-timeline";

type MedicalRecordType = "EXAM" | "SURGERY" | "LAB" | "MEDICATION" | "OTHER";

type TimelineItem = {
  id: string;
  date: string;
  title: string;
  description: string;
  recordType: MedicalRecordType;
};

type MedicalRecordManagerProps = {
  petId: string;
  initialItems: TimelineItem[];
};

const today = new Date().toISOString().slice(0, 10);

const normalizeDate = (value: string) => value.slice(0, 10);

export function MedicalRecordManager({ petId, initialItems }: MedicalRecordManagerProps) {
  const [items, setItems] = useState<TimelineItem[]>(initialItems);
  const [date, setDate] = useState(today);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [recordType, setRecordType] = useState<MedicalRecordType>("EXAM");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => b.date.localeCompare(a.date)),
    [items]
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/pets/${petId}/medical-records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          title,
          description,
          recordType
        })
      });

      if (!response.ok) {
        throw new Error("failed");
      }

      const payload = (await response.json()) as {
        data: {
          id: string;
          date: string;
          title: string;
          description: string;
          recordType: MedicalRecordType;
        };
      };

      setItems((prev) => [
        {
          id: payload.data.id,
          date: normalizeDate(payload.data.date),
          title: payload.data.title,
          description: payload.data.description,
          recordType: payload.data.recordType
        },
        ...prev
      ]);
      setTitle("");
      setDescription("");
    } catch {
      setError("記録追加に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-3">
      <form onSubmit={onSubmit} className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">記録を追加</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            required
          />
          <select
            value={recordType}
            onChange={(event) => setRecordType(event.target.value as MedicalRecordType)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="EXAM">診察</option>
            <option value="SURGERY">手術</option>
            <option value="LAB">検査</option>
            <option value="MEDICATION">投薬</option>
            <option value="OTHER">その他</option>
          </select>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="タイトル"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2"
            required
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="内容"
            className="min-h-20 rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          {isSaving ? "保存中..." : "記録を保存"}
        </button>
        {error && <p className="mt-2 text-xs text-rose-700">{error}</p>}
      </form>

      <MedicalTimeline items={sortedItems} />
    </section>
  );
}
