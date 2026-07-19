"use client";

import { use, useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Message = {
  id: string;
  senderId: string;
  isAdmin: boolean;
  body: string;
  createdAt: string;
};

type Ticket = {
  id: string;
  title: string;
  category: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  createdAt: string;
  messages: Message[];
};

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch(`/api/support/tickets/${id}`);
        if (!res.ok) throw new Error("問い合わせ情報の取得に失敗しました");
        const json = await res.json();
        if (active) {
          setTicket(json.data);
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
  }, [id, refreshTrigger]);

  // Scroll to bottom on load or new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;
    setIsSending(true);

    try {
      const res = await fetch(`/api/support/tickets/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newMessage })
      });

      if (!res.ok) throw new Error("返信の送信に失敗しました");

      setNewMessage("");
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const getCategoryLabel = (cat?: string) => {
    switch (cat) {
      case "BUG":
        return "不具合";
      case "FEATURE":
        return "要望";
      case "BILLING":
        return "料金・課金";
      default:
        return "その他";
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "OPEN":
        return <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">返信待ち</span>;
      case "IN_PROGRESS":
        return <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300">対応中</span>;
      case "RESOLVED":
        return <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">解決済</span>;
      case "CLOSED":
        return <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-300">対応終了</span>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
        {error || "問い合わせが見つかりませんでした。"}
        <div className="mt-2">
          <Link href="/support" className="font-semibold underline">お問い合わせ一覧に戻る</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Header */}
      <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
        <Link href="/support" className="text-xs text-slate-500 hover:underline">
          ← 問い合わせ一覧へ
        </Link>
        <div className="mt-1 flex items-start justify-between gap-4">
          <div>
            <span className="text-xs text-slate-500">{getCategoryLabel(ticket.category)}</span>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">{ticket.title}</h1>
          </div>
          {getStatusBadge(ticket.status)}
        </div>
      </div>

      {/* Messages timeline */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {ticket.messages.map((msg) => {
          const isUser = !msg.isAdmin;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                  isUser
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-tr-none"
                    : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100 rounded-tl-none"
                }`}
              >
                {msg.body}
              </div>
              <span className="mt-1 text-[10px] text-slate-400">
                {isUser ? "あなた" : "サポート運営"} •{" "}
                {new Date(msg.createdAt).toLocaleTimeString("ja-JP", {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply input */}
      {ticket.status !== "CLOSED" ? (
        <form onSubmit={(e) => { void handleSendMessage(e); }} className="mt-2 border-t border-slate-200 pt-3 dark:border-slate-800">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="メッセージを入力..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isSending}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
            >
              送信
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-2 rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-500 dark:bg-slate-900/50">
          この問い合わせはクローズされています。返信はできません。
        </div>
      )}
    </div>
  );
}
