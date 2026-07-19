"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

type EmergencyQrShareCardProps = {
  petId: string;
  initialToken?: string;
};

export function EmergencyQrShareCard({ petId, initialToken }: EmergencyQrShareCardProps) {
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(!initialToken);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isQrLoading, setIsQrLoading] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [isQrVisible, setIsQrVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialToken) {
      return;
    }

    const abortController = new AbortController();

    const loadToken = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/pets/${petId}/qr-token`, { signal: abortController.signal });
        if (!response.ok) {
          throw new Error("failed");
        }
        const payload = (await response.json()) as { data: { token: string } };
        setToken(payload.data.token);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setError("QRトークンの取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    void loadToken();

    return () => {
      abortController.abort();
    };
  }, [petId, initialToken]);

  const resolvedToken = token || initialToken || "";
  const resolvedPublicUrl = resolvedToken
    ? (typeof window !== "undefined" ? `${window.location.origin}/e/${resolvedToken}` : `/e/${resolvedToken}`)
    : "";

  const showQr = async () => {
    if (!resolvedToken) {
      return;
    }

    if (qrImage) {
      setIsQrVisible((current) => !current);
      return;
    }

    setIsQrLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/pets/${petId}/qr-image`);
      if (!response.ok) {
        throw new Error("failed");
      }
      const payload = (await response.json()) as { data: { image: string } };
      setQrImage(payload.data.image);
      setIsQrVisible(true);
    } catch {
      setError("QR画像の取得に失敗しました");
    } finally {
      setIsQrLoading(false);
    }
  };

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
      setQrImage(null);
      setIsQrVisible(false);
    } catch {
      setError("トークン再生成に失敗しました");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <section className="rounded-2xl border border-white/5 bg-slate-950/40 p-5 shadow-inner backdrop-blur-sm">
      <h2 className="text-base font-bold text-white">QR共有</h2>
      <p className="mt-2 text-sm text-slate-400">緊急時に必要最小限の情報を公開するURLです。</p>
      
      <div className="mt-3 rounded-xl bg-slate-950/80 border border-white/5 p-3 text-xs text-slate-300 font-mono break-all" suppressHydrationWarning>
        {isLoading ? "読み込み中..." : resolvedPublicUrl}
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={resolvedToken ? `/e/${resolvedToken}` : "#"}
          className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-all active:scale-95 ${
            resolvedToken ? "bg-gradient-to-r from-red-600 to-rose-500 hover:opacity-95 shadow-md shadow-red-900/10" : "bg-slate-700 pointer-events-none opacity-40"
          }`}
        >
          公開画面を確認
        </Link>
        <button
          type="button"
          onClick={showQr}
          disabled={!resolvedToken || isLoading || isQrLoading}
          className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-white/10 active:scale-95 disabled:opacity-60 transition-all"
        >
          {isQrLoading ? "QR取得中..." : isQrVisible ? "QRを隠す" : "QRを表示"}
        </button>
        <button
          type="button"
          onClick={regenerate}
          disabled={isUpdating || isLoading}
          className="inline-flex items-center justify-center rounded-xl bg-slate-800 border border-white/5 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-750 active:scale-95 disabled:opacity-60 transition-all"
        >
          {isUpdating ? "再生成中..." : "トークン再生成"}
        </button>
      </div>

      {isQrVisible && qrImage ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white p-4 max-w-[224px] mx-auto shadow-lg">
          <Image src={qrImage} alt="公開URLのQRコード" width={192} height={192} unoptimized className="mx-auto h-48 w-48" />
        </div>
      ) : null}
      
      {error && <p className="mt-2.5 text-xs text-rose-400 font-semibold">{error}</p>}
    </section>
  );
}
