"use client";

import { FormEvent, useMemo, useState } from "react";
import { VaccinationHistory } from "@/components/features/pets/vaccination-history";

type VaccinationType = "RABIES" | "CORE" | "HEARTWORM" | "FLEA_TICK" | "OTHER";

type VaccinationItem = {
  id: string;
  typeCode: VaccinationType;
  type: string;
  date: string;
  nextDue: string | null;
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
      date: item.date,
      nextDue: item.nextDue
    }))
  );
  const [type, setType] = useState<VaccinationType>("CORE");
  const [date, setDate] = useState(today);
  const [nextDue, setNextDue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => b.date.localeCompare(a.date)),
    [items]
  );

  const resetForm = () => {
    setType("CORE");
    setDate(today);
    setNextDue("");
    setEditingId(null);
  };

  const onEditStart = (item: VaccinationItem) => {
    setEditingId(item.id);
    setType(item.typeCode);
    setDate(item.date);
    setNextDue(item.nextDue ?? "");
    setError(null);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/pets/${petId}/vaccinations`, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId ?? undefined,
          type,
          date,
          nextDue: nextDue || null
        })
      });

      if (!response.ok) {
        throw new Error("failed");
      }

      const payload = (await response.json()) as {
        data: { id: string; type: VaccinationType; date: string; nextDue: string | null };
      };

      const normalizedItem: VaccinationItem = {
        id: payload.data.id,
        typeCode: payload.data.type,
        type: typeLabelMap[payload.data.type],
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

  return (
    <section className="space-y-3">
      <VaccinationHistory items={sortedItems} editingId={editingId} onEdit={onEditStart} />

      <form onSubmit={onSubmit} className="rounded-2xl bg-white p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900">
          {editingId ? "ワクチン履歴を編集" : "ワクチン履歴を追加"}
        </h3>
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
        <div className="mt-3 flex items-center gap-2">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
          >
            {isSaving ? "保存中..." : editingId ? "変更を保存" : "履歴を保存"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              disabled={isSaving}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 disabled:opacity-60"
            >
              キャンセル
            </button>
          )}
        </div>
        {error && <p className="mt-2 text-xs text-rose-700">{error}</p>}
      </form>
    </section>
  );
}
