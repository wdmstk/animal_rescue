"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";

type AnnouncementFormData = {
  title: string;
  body: string;
  isPublished: boolean;
  expiresAt: string;
};

export function CreateAnnouncementForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<AnnouncementFormData>({
    title: "",
    body: "",
    isPublished: false,
    expiresAt: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        body: form.body,
        isPublished: form.isPublished,
        expiresAt: form.expiresAt || null
      })
    });
    if (!res.ok) {
      alert("作成に失敗しました");
      return;
    }
    setIsOpen(false);
    setForm({ title: "", body: "", isPublished: false, expiresAt: "" });
    startTransition(() => { router.refresh(); });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-teal-500"
      >
        + 新規お知らせ作成
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-2xl border border-white/10 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md">
      <h3 className="mb-4 text-base font-bold text-white">📝 新規お知らせ作成</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300">タイトル</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none"
            placeholder="例: システムメンテナンスのお知らせ"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300">本文</label>
          <textarea
            required
            rows={4}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none"
            placeholder="お知らせの詳しい本文を入力してください..."
          />
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isPublished"
            checked={form.isPublished}
            onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
            className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-teal-500 focus:ring-teal-400"
          />
          <label htmlFor="isPublished" className="text-xs font-semibold text-slate-200">
            今すぐ公開する
          </label>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300">
            有効期限（任意）
          </label>
          <input
            type="datetime-local"
            value={form.expiresAt}
            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            className="mt-1 rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-teal-400 focus:outline-none"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-teal-500 disabled:opacity-60"
          >
            保存する
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-xl border border-white/10 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700"
          >
            キャンセル
          </button>
        </div>
      </div>
    </form>
  );
}

export function DeleteAnnouncementButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    if (!confirm(`「${title}」を削除しますか？`)) return;
    const res = await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("削除に失敗しました");
      return;
    }
    startTransition(() => { router.refresh(); });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-lg border border-red-500/30 bg-red-500/20 px-2.5 py-1 text-xs font-semibold text-red-300 hover:bg-red-500/30 disabled:opacity-50"
    >
      削除
    </button>
  );
}

export function TogglePublishButton({ id, isPublished }: { id: string; isPublished: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggle = async () => {
    const res = await fetch(`/api/admin/announcements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !isPublished })
    });
    if (!res.ok) {
      alert("更新に失敗しました");
      return;
    }
    startTransition(() => { router.refresh(); });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`rounded-full px-3 py-1 text-xs font-bold transition-all disabled:opacity-50 ${
        isPublished
          ? "bg-teal-500/20 border border-teal-400/40 text-teal-300 hover:bg-teal-500/30"
          : "bg-slate-800 border border-white/10 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
      }`}
    >
      {isPublished ? "● 公開中" : "○ 下書き"}
    </button>
  );
}
