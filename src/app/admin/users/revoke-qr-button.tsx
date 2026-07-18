"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function RevokeQrButton({ petId, petName }: { petId: string; petName: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRevoke = async () => {
    if (!confirm(`「${petName}」のQRトークンを強制無効化しますか？\nこの操作はQRコードのスキャンを即時停止します。`))
      return;

    const res = await fetch(`/api/admin/pets/${petId}/qr-token/revoke`, {
      method: "POST"
    });

    if (!res.ok) {
      alert("無効化に失敗しました");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleRevoke}
      disabled={isPending}
      className="rounded bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
    >
      {isPending ? "処理中…" : "QR無効化"}
    </button>
  );
}
