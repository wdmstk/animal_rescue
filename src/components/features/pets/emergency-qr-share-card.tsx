"use client";

import Link from "next/link";
import { useState } from "react";

type EmergencyQrShareCardProps = {
  petId: string;
  initialToken: string;
};

export function EmergencyQrShareCard({ petId, initialToken }: EmergencyQrShareCardProps) {
  const [token, setToken] = useState(initialToken);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const regenerate = async () => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch(`/api/pets/${petId}/qr-token`, {
        method: "POST"
      });

      if (!response.ok) {
        throw new Error("failed");
      }

      const payload = (await response.json()) as { data: { token: string } };
      setToken(payload.data.token);
    } catch {
      setError("トークン再生成に失敗しました");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <section className="rounded-2xl border border-emergency-100 bg-white p-4 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">QR共有</h2>
      <p className="mt-2 text-sm text-slate-600">緊急時に必要最小限の情報を公開するURLです。</p>
      <div className="mt-3 rounded-lg bg-slate-100 p-2 text-xs text-slate-700 break-all">/e/{token}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={`/e/${token}`} className="rounded-lg bg-emergency-500 px-3 py-2 text-xs font-semibold text-white">
          公開画面を確認
        </Link>
        <button
          type="button"
          onClick={regenerate}
          disabled={isUpdating}
          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          {isUpdating ? "再生成中..." : "トークン再生成"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-rose-700">{error}</p>}
    </section>
  );
}
