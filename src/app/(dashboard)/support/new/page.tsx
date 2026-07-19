"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";

export default function NewSupportPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"BUG" | "FEATURE" | "BILLING" | "OTHER">("OTHER");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, message })
      });

      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error || "送信に失敗しました");
      }

      router.push("/support");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/support" className="text-xs text-slate-500 hover:underline">
          ← 問い合わせ一覧へ戻る
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">新規お問い合わせ</h1>
      </div>

      <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label htmlFor="category" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            カテゴリ
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            <option value="BUG">不具合・バグ報告</option>
            <option value="FEATURE">ご要望・改善案</option>
            <option value="BILLING">料金・お支払いについて</option>
            <option value="OTHER">その他</option>
          </select>
        </div>

        <FormField
          label="件名"
          required
        >
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
            placeholder="例：ワクチンの通知が届かない"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </FormField>

        <FormField
          label="お問い合わせ内容"
          required
        >
          <textarea
            id="message"
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            maxLength={2000}
            placeholder="不具合の発生手順やご要望の詳細をご記入ください。"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </FormField>

        <SubmitButton isSubmitting={isLoading} idleLabel="送信する" submittingLabel="送信中..." />
      </form>
    </div>
  );
}
