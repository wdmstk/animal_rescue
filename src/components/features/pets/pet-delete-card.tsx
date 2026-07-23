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
  const [isArchiving, setIsArchiving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
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

  const handleArchive = async () => {
    setIsArchiving(true);
    setError(null);

    try {
      const response = await fetch(`/api/pets/${petId}/archive`, {
        method: "POST"
      });

      if (!response.ok) {
        throw new Error("思い出モードへの移行に失敗しました");
      }

      setShowArchiveConfirm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "思い出モードへの移行に失敗しました");
      setIsArchiving(false);
    }
  };

  if (showArchiveConfirm) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-emerald-900">思い出モードへの移行確認</h3>
        <p className="mb-4 text-xs text-emerald-700">
          「{petName}」の情報を思い出モードに移行（アーカイブ）します。緊急共有QRコードは無効化されますが、これまでの健康ログや写真はいつでも閲覧・管理が可能です。よろしいですか？
        </p>
        {error && (
          <p className="mb-3 rounded-lg border border-rose-300 bg-rose-100 px-3 py-2 text-xs text-rose-800">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowArchiveConfirm(false);
              setError(null);
            }}
            disabled={isArchiving}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleArchive}
            disabled={isArchiving}
            className="rounded-lg border border-emerald-500 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {isArchiving ? "移行中..." : "思い出モードにする"}
          </button>
        </div>
      </div>
    );
  }

  if (showConfirm) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-rose-900">削除の確認</h3>
        <p className="mb-4 text-xs text-rose-700">
          「{petName}」を完全に削除します。この操作は取り消せません。よろしいですか？
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

  return (
    <div id="delete" className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md text-white">
        <h3 className="mb-1.5 text-sm font-bold text-emerald-300 flex items-center gap-2">🕯️ 思い出モード（アーカイブ）への移行</h3>
        <p className="mb-4 text-xs text-slate-300">
          ペットがお亡くなりになった後、これまでの健康ログや思い出の写真を大切に保管・振り返るモードへ移行します。緊急公開用QRコードは自動で無効化されます。
        </p>
        <button
          type="button"
          onClick={() => setShowArchiveConfirm(true)}
          className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20 active:scale-95 shadow-sm"
        >
          🕯️ 思い出モードに移行する
        </button>
      </div>

      <div className="rounded-2xl border border-rose-500/20 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md text-white">
        <h3 className="mb-1.5 text-sm font-bold text-rose-400 flex items-center gap-2">🗑️ ペット削除</h3>
        <p className="mb-4 text-xs text-slate-300">
          このペットのデータを完全に削除します。この操作は取り消せません。
        </p>
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-300 transition hover:bg-rose-500/20 active:scale-95 shadow-sm"
        >
          削除する
        </button>
      </div>
    </div>
  );
}
