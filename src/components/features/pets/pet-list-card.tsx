"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ToastMessage } from "@/components/ui/toast-message";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const onDelete = async () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteDialog(false);
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

  const onShowQr = async () => {
    setIsLoadingQr(true);
    setError(null);

    try {
      const response = await fetch(`/api/pets/${id}/qr-token`, {
        method: "GET"
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: unknown } | null;
        const message = typeof payload?.error === "string" ? payload.error : "QRの取得に失敗しました";
        throw new Error(message);
      }

      const data = await response.json() as { data: { publicUrl: string } };
      setQrUrl(data.data.publicUrl);
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : "QRの取得に失敗しました");
    } finally {
      setIsLoadingQr(false);
    }
  };

  const speciesEmojiMap: Record<"dog" | "cat" | "other", string> = {
    dog: "🐶",
    cat: "🐱",
    other: "🐾"
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:border-slate-700/80 dark:bg-slate-800/90 dark:hover:border-slate-600 dark:backdrop-blur-md">
        <Link
          href={`/pets/${id}`}
          className="block group"
          aria-label={`${name} ${speciesLabelMap[species]} / ${breed ?? "未登録"}`}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label={speciesLabelMap[species]}>
              {speciesEmojiMap[species]}
            </span>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400 transition-colors">
              {name}
            </h3>
          </div>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 pl-8">
            種類: {speciesLabelMap[species]} &middot; {breed ?? "種類未登録"}
          </p>
        </Link>
        
        <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-700/50">
          <button
            type="button"
            onClick={onShowQr}
            disabled={isLoadingQr}
            aria-label={`${name}の緊急QRを表示`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-rose-500/10 hover:bg-rose-600 hover:shadow-md active:scale-95 disabled:opacity-50 transition-all min-h-[44px]"
          >
            <span>🚨</span>
            {isLoadingQr ? "読み込み中..." : "緊急QRを表示"}
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            aria-label={`${name}を削除`}
            className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 active:scale-95 disabled:opacity-50 transition-all min-h-[44px] dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            {isDeleting ? "削除中..." : "削除"}
          </button>
        </div>
        <ToastMessage message={error} type="error" />
      </div>

      {qrUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setQrUrl(null)}>
          <div className="rounded-2xl bg-white p-6 shadow-lg max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">{name}の緊急QR</h3>
              <button
                onClick={() => setQrUrl(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
                aria-label="閉じる"
              >
                ×
              </button>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <img
                src={`/api/pets/${id}/qr-image`}
                alt={`${name}の緊急QRコード`}
                className="w-full h-auto"
              />
            </div>
            <p className="mt-4 text-center text-sm text-slate-600">
              このQRコードをスキャンすると緊急情報が表示されます
            </p>
            <a
              href={qrUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block w-full rounded-lg bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent min-h-[44px]"
            >
              公開URLを開く
            </a>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="ペットを削除"
        message={`「${name}」を削除します。この操作は取り消せません。`}
        confirmLabel="削除"
        cancelLabel="キャンセル"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </>
  );
}
