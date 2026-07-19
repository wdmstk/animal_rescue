"use client";

import { FormEvent, useMemo, useState } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import { ToastMessage } from "@/components/ui/toast-message";

type InviteResponse = {
  data: {
    code: string;
    expiresAt: string;
  };
};

type InviteErrorResponse = {
  error?: string;
};

export function HouseholdInviteCodeCard() {
  const [expiresInHours, setExpiresInHours] = useState("48");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [issuedCode, setIssuedCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const inviteJoinPath = useMemo(() => {
    if (!issuedCode) {
      return null;
    }
    return `/invite/join?code=${encodeURIComponent(issuedCode)}`;
  }, [issuedCode]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setCopied(false);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/households/invite-codes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          expiresInHours: Number(expiresInHours)
        })
      });

      const payload = (await response.json().catch(() => null)) as (InviteResponse & InviteErrorResponse) | null;

      if (!response.ok) {
        setErrorMessage(typeof payload?.error === "string" ? payload.error : "招待コードの発行に失敗しました。");
        return;
      }

      if (!payload?.data) {
        setErrorMessage("招待コードの発行に失敗しました。");
        return;
      }

      setIssuedCode(payload.data.code);
      setExpiresAt(payload.data.expiresAt);
    } catch {
      setErrorMessage("通信エラーが発生しました。時間をおいて再度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCopy = async () => {
    if (!issuedCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(issuedCode);
      setCopied(true);
    } catch {
      setErrorMessage("コピーに失敗しました。手動でコピーしてください。");
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md text-white">
      <h2 className="text-base font-bold text-white">家族招待コード</h2>
      <p className="mt-1 text-sm text-slate-400">家族に共有するための招待コードを発行します。</p>

      <form className="mt-4 flex items-end gap-3" onSubmit={onSubmit}>
        <label className="flex-1 text-sm font-medium text-slate-300">
          有効期限（時間）
          <input
            type="number"
            min={1}
            max={168}
            value={expiresInHours}
            onChange={(event) => setExpiresInHours(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white focus:border-blue-500/50 focus:outline-none transition-all"
          />
        </label>
        <SubmitButton
          isSubmitting={isSubmitting}
          idleLabel="発行"
          submittingLabel="保存中..."
          className="bg-slate-800 border border-white/10 hover:bg-slate-750 text-white rounded-xl font-bold min-h-[44px] px-5 transition-all"
        />
      </form>

      {issuedCode ? (
        <div className="mt-4 rounded-xl border border-white/5 bg-slate-950/50 p-4">
          <p className="text-xs text-slate-400">発行済みコード</p>
          <p className="mt-1 font-mono text-xl font-bold text-blue-400">{issuedCode}</p>
          <p className="mt-1 text-xs text-slate-400">有効期限: {expiresAt ? new Date(expiresAt).toLocaleString("ja-JP") : "-"}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onCopy}
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 active:scale-95 transition-all min-h-[36px]"
            >
              コードをコピー
            </button>
            {inviteJoinPath ? <p className="text-xs text-slate-400">参加URL: <span className="font-mono text-slate-300">{inviteJoinPath}</span></p> : null}
          </div>
          <div className="mt-2">
            <ToastMessage message={copied ? "コピーしました。" : null} type="success" />
          </div>
        </div>
      ) : null}

      <ToastMessage message={errorMessage} type="error" />
    </section>
  );
}
