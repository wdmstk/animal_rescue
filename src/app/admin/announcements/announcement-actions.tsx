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
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
      >
        + 新規作成
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-base font-bold text-slate-900">新規お知らせ作成</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500">タイトル</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500">本文</label>
          <textarea
            required
            rows={4}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isPublished"
            checked={form.isPublished}
            onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
            className="h-4 w-4"
          />
          <label htmlFor="isPublished" className="text-sm text-slate-700">
            今すぐ公開する
          </label>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500">
            有効期限（任意）
          </label>
          <input
            type="datetime-local"
            value={form.expiresAt}
            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
        >
          作成する
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
        >
          キャンセル
        </button>
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
      className="rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
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
      className={`rounded px-2 py-1 text-xs font-semibold disabled:opacity-50 ${
        isPublished
          ? "bg-green-50 text-green-700 hover:bg-green-100"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {isPublished ? "公開中" : "下書き"}
    </button>
  );
}
