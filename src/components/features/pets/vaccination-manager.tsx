"use client";

import { FormEvent, useMemo, useState } from "react";
import { VaccinationHistory } from "@/components/features/pets/vaccination-history";

type VaccinationType = "RABIES" | "CORE" | "HEARTWORM" | "FLEA_TICK" | "OTHER";

type VaccinationItem = {
  type: string;
  date: string;
  nextDue: string | null;
};

type VaccinationManagerProps = {
  petId: string;
  initialItems: VaccinationItem[];
};

const today = new Date().toISOString().slice(0, 10);

const typeLabelMap: Record<VaccinationType, string> = {
  RABIES: "狂犬病",
  CORE: "混合ワクチン",
  HEARTWORM: "フィラリア",
  FLEA_TICK: "ノミ・ダニ",
  OTHER: "その他"
};

const normalizeDate = (value: string) => value.slice(0, 10);

export function VaccinationManager({ petId, initialItems }: VaccinationManagerProps) {
  const [items, setItems] = useState<VaccinationItem[]>(initialItems);
  const [type, setType] = useState<VaccinationType>("CORE");
  const [date, setDate] = useState(today);
  const [nextDue, setNextDue] = useState("");
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
      const response = await fetch(`/api/pets/${petId}/vaccinations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          date,
          nextDue: nextDue || null
        })
      });

      if (!response.ok) {
        throw new Error("failed");
      }

      const payload = (await response.json()) as {
        data: { type: VaccinationType; date: string; nextDue: string | null };
      };

      setItems((prev) => [
        {
          type: typeLabelMap[payload.data.type],
          date: normalizeDate(payload.data.date),
          nextDue: payload.data.nextDue ? normalizeDate(payload.data.nextDue) : null
        },
        ...prev
      ]);
      setNextDue("");
    } catch {
      setError("ワクチン履歴の追加に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-3">
      <VaccinationHistory items={sortedItems} />

      <form onSubmit={onSubmit} className="rounded-2xl bg-white p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900">ワクチン履歴を追加</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <select
            value={type}
            onChange={(event) => setType(event.target.value as VaccinationType)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {Object.entries(typeLabelMap).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            required
          />
          <input
            type="date"
            value={nextDue}
            onChange={(event) => setNextDue(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          {isSaving ? "保存中..." : "履歴を保存"}
        </button>
        {error && <p className="mt-2 text-xs text-rose-700">{error}</p>}
      </form>
    </section>
  );
}
