"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PetDeleteCardProps {
  petId: string;
  petName: string;
}

export function PetDeleteCard({ petId, petName }: PetDeleteCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/pets/${petId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "削除に失敗しました" }));
        throw new Error(errorData.error || "削除に失敗しました");
      }

      router.push("/pets");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除に失敗しました");
      setIsDeleting(false);
    }
  };

  if (!showConfirm) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-slate-900">ペット削除</h3>
        <p className="mb-4 text-xs text-slate-600">
          このペットのデータを完全に削除します。この操作は取り消せません。
        </p>
        <button
          onClick={() => setShowConfirm(true)}
          className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
        >
          削除する
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
      <h3 className="mb-2 text-sm font-semibold text-rose-900">削除の確認</h3>
      <p className="mb-4 text-xs text-rose-700">
        「{petName}」を削除します。この操作は取り消せません。よろしいですか？
      </p>
      {error && (
        <p className="mb-3 rounded-lg border border-rose-300 bg-rose-100 px-3 py-2 text-xs text-rose-800">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => {
            setShowConfirm(false);
            setError(null);
          }}
          disabled={isDeleting}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          キャンセル
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-lg border border-rose-500 bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
        >
          {isDeleting ? "削除中..." : "削除する"}
        </button>
      </div>
    </div>
  );
}
