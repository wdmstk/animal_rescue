"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ToastMessage } from "@/components/ui/toast-message";

type PetListCardProps = {
  id: string;
  name: string;
  species: "dog" | "cat" | "other";
  breed: string | null;
};

const speciesLabelMap: Record<"dog" | "cat" | "other", string> = {
  dog: "犬",
  cat: "猫",
  other: "その他"
};

export function PetListCard({ id, name, species, breed }: PetListCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDelete = async () => {
    const confirmed = window.confirm(`「${name}」を削除します。この操作は取り消せません。`);
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/pets/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: unknown } | null;
        const message = typeof payload?.error === "string" ? payload.error : "削除に失敗しました";
        throw new Error(message);
      }

      router.refresh();
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : "削除に失敗しました");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <Link href={`/pets/${id}`} className="block">
        <h3 className="text-base font-bold text-slate-900">{name}</h3>
        <p className="text-sm text-slate-600">
          {speciesLabelMap[species]} / {breed ?? "未登録"}
        </p>
      </Link>
      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="rounded-lg border border-rose-300 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 disabled:opacity-50"
        >
          {isDeleting ? "削除中..." : "削除"}
        </button>
      </div>
      <ToastMessage message={error} type="error" />
    </div>
  );
}
