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

      const payload = (await response.json().catch(() => null)) as InviteResponse | { error?: string } | null;

      if (!response.ok) {
        setErrorMessage(typeof payload?.error === "string" ? payload.error : "招待コードの発行に失敗しました。");
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
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">家族招待コード</h2>
      <p className="mt-1 text-sm text-slate-600">家族に共有するための招待コードを発行します。</p>

      <form className="mt-3 flex items-end gap-2" onSubmit={onSubmit}>
        <label className="flex-1 text-sm font-semibold text-slate-800">
          有効期限（時間）
          <input
            type="number"
            min={1}
            max={168}
            value={expiresInHours}
            onChange={(event) => setExpiresInHours(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <SubmitButton isSubmitting={isSubmitting} idleLabel="発行" submittingLabel="保存中..." />
      </form>

      {issuedCode ? (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs text-slate-600">発行済みコード</p>
          <p className="mt-1 font-mono text-lg font-bold text-slate-900">{issuedCode}</p>
          <p className="mt-1 text-xs text-slate-600">有効期限: {expiresAt ? new Date(expiresAt).toLocaleString("ja-JP") : "-"}</p>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={onCopy} className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-800">
              コードをコピー
            </button>
            {inviteJoinPath ? <p className="text-xs text-slate-600">参加URL: {inviteJoinPath}</p> : null}
          </div>
          <div className="mt-1">
            <ToastMessage message={copied ? "コピーしました。" : null} type="success" />
          </div>
        </div>
      ) : null}

      <ToastMessage message={errorMessage} type="error" />
    </section>
  );
}
