"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Ticket = {
  id: string;
  userId: string;
  title: string;
  category: "BUG" | "FEATURE" | "BILLING" | "OTHER";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const url = statusFilter === "ALL" ? "/api/admin/tickets" : `/api/admin/tickets?status=${statusFilter}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("問い合わせ一覧の取得に失敗しました");
        const json = await res.json();
        if (active) {
          setTickets(json.data);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [statusFilter, refreshTrigger]);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "BUG":
        return "🐞 不具合";
      case "FEATURE":
        return "💡 要望";
      case "BILLING":
        return "💳 料金・課金";
      default:
        return "❓ その他";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 text-xs font-semibold text-amber-300">未対応 (OPEN)</span>;
      case "IN_PROGRESS":
        return <span className="rounded-full bg-blue-500/20 border border-blue-500/30 px-2.5 py-1 text-xs font-semibold text-blue-300">対応中 (IN_PROGRESS)</span>;
      case "RESOLVED":
        return <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-300">解決済 (RESOLVED)</span>;
      case "CLOSED":
        return <span className="rounded-full bg-slate-800 border border-white/5 px-2.5 py-1 text-xs font-semibold text-slate-400">クローズ (CLOSED)</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">🎫 問い合わせ（チケット）管理</h1>
        <button
          onClick={() => setRefreshTrigger((prev) => prev + 1)}
          className="rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800"
        >
          🔄 更新
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex border border-white/10 bg-slate-900/80 p-1.5 rounded-xl max-w-lg backdrop-blur-md">
        {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`flex-1 rounded-lg py-1.5 text-center text-xs font-bold transition-all ${
              statusFilter === status
                ? "bg-teal-600 text-white shadow-md"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            {status === "ALL"
              ? "全部"
              : status === "OPEN"
              ? "未対応"
              : status === "IN_PROGRESS"
              ? "対応中"
              : status === "RESOLVED"
              ? "解決済"
              : "クローズ"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-teal-400" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-200">{error}</div>
      ) : tickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/50 py-12 text-center">
          <p className="text-sm text-slate-400">該当するお問い合わせはありません。</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-xl backdrop-blur-md">
          <table className="min-w-full divide-y divide-white/10 text-xs text-slate-300">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  状態
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  カテゴリ
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  件名 / チケットID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  更新日時
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-6 py-4">{getStatusBadge(ticket.status)}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                    {getCategoryLabel(ticket.category)}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/tickets/${ticket.id}`} className="font-bold text-slate-900 hover:underline">
                      {ticket.title}
                    </Link>
                    <p className="text-xs text-slate-400">{ticket.id}</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {new Date(ticket.updatedAt).toLocaleString("ja-JP")}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <Link
                      href={`/admin/tickets/${ticket.id}`}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 font-semibold text-slate-800 hover:bg-slate-200"
                    >
                      詳細・返信 →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
