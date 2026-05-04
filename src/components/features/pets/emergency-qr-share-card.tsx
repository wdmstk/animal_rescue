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
    <section className="rounded-2xl border border-emergency-100 bg-white p-4 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">QR共有</h2>
      <p className="mt-2 text-sm text-slate-600">緊急時に必要最小限の情報を公開するURLです。</p>
      <div className="mt-3 rounded-lg bg-slate-100 p-2 text-xs text-slate-700 break-all" suppressHydrationWarning>
        {isLoading ? "読み込み中..." : resolvedPublicUrl}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={resolvedToken ? `/e/${resolvedToken}` : "#"}
          className={`rounded-lg px-3 py-2 text-xs font-semibold text-white ${
            resolvedToken ? "bg-emergency-500" : "bg-slate-400 pointer-events-none"
          }`}
        >
          公開画面を確認
        </Link>
        <button
          type="button"
          onClick={showQr}
          disabled={!resolvedToken || isLoading || isQrLoading}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 disabled:opacity-60"
        >
          {isQrLoading ? "QR取得中..." : isQrVisible ? "QRを隠す" : "QRを表示"}
        </button>
        <button
          type="button"
          onClick={regenerate}
          disabled={isUpdating || isLoading}
          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          {isUpdating ? "再生成中..." : "トークン再生成"}
        </button>
      </div>
      {isQrVisible && qrImage ? (
        <div className="mt-3 rounded-lg border border-slate-200 bg-white p-2">
          <Image src={qrImage} alt="公開URLのQRコード" width={192} height={192} unoptimized className="mx-auto h-48 w-48" />
        </div>
      ) : null}
      {error && <p className="mt-2 text-xs text-rose-700">{error}</p>}
    </section>
  );
}
