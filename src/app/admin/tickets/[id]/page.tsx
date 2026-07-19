"use client";

import { use, useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";

type Message = {
  id: string;
  senderId: string;
  isAdmin: boolean;
  body: string;
  createdAt: string;
};

type UserProfile = {
  ownerUserId: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
};

type Ticket = {
  id: string;
  userId: string;
  title: string;
  category: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  userProfile: UserProfile;
};

export default function AdminTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch(`/api/admin/tickets/${id}`);
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;
    setIsSending(true);

    try {
      const res = await fetch(`/api/admin/tickets/${id}/messages`, {
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

  const handleUpdateStatus = async (status: string) => {
    try {
      const res = await fetch(`/api/admin/tickets/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (!res.ok) throw new Error("ステータスの更新に失敗しました");

      setRefreshTrigger((prev) => prev + 1);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getCategoryLabel = (cat?: string) => {
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

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
        {error || "問い合わせが見つかりませんでした。"}
        <div className="mt-2">
          <Link href="/admin/tickets" className="font-semibold underline">問い合わせ管理一覧に戻る</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Thread Chat Area */}
      <div className="lg:col-span-2 flex flex-col h-[calc(100vh-12rem)] border border-slate-200 bg-white rounded-xl p-4 shadow-sm">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">{getCategoryLabel(ticket.category)}</span>
            <h1 className="text-lg font-bold text-slate-950">{ticket.title}</h1>
          </div>
          <Link href="/admin/tickets" className="text-xs text-slate-500 hover:underline">
            ← 一覧に戻る
          </Link>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {ticket.messages.map((msg) => {
            const isUser = !msg.isAdmin;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? "items-start" : "items-end"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                    isUser
                      ? "bg-slate-100 text-slate-800 rounded-tl-none"
                      : "bg-slate-900 text-white rounded-tr-none"
                  }`}
                >
                  {msg.body}
                </div>
                <span className="mt-1 text-[10px] text-slate-400">
                  {isUser ? "ユーザー" : "サポート（あなた）"} •{" "}
                  {new Date(msg.createdAt).toLocaleString("ja-JP", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Area */}
        <form onSubmit={(e) => { void handleSendMessage(e); }} className="border-t border-slate-100 pt-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="メッセージを入力..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isSending}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              返信
            </button>
          </div>
        </form>
      </div>

      {/* Ticket Details & Action Panel */}
      <div className="space-y-6">
        {/* Submitter User Info */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">起票者情報</h2>
          <div className="text-sm space-y-1.5">
            <p className="text-slate-500">
              ユーザー名: <span className="font-semibold text-slate-800">{ticket.userProfile.fullName || "登録なし"}</span>
            </p>
            <p className="text-slate-500">
              メール: <span className="font-semibold text-slate-800">{ticket.userProfile.email || "登録なし"}</span>
            </p>
            <p className="text-slate-500">
              電話番号: <span className="font-semibold text-slate-800">{ticket.userProfile.phone || "登録なし"}</span>
            </p>
            <p className="text-xs text-slate-400">ユーザーID: {ticket.userId}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">チケット管理操作</h2>
          <div className="space-y-2 text-sm">
            <p className="text-slate-500">
              現在の状態:{" "}
              <span className="font-bold text-slate-800">
                {ticket.status === "OPEN"
                  ? "未対応"
                  : ticket.status === "IN_PROGRESS"
                  ? "対応中"
                  : ticket.status === "RESOLVED"
                  ? "解決済"
                  : "クローズ"}
              </span>
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => void handleUpdateStatus("IN_PROGRESS")}
                disabled={ticket.status === "IN_PROGRESS"}
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
              >
                対応中にする
              </button>
              <button
                onClick={() => void handleUpdateStatus("RESOLVED")}
                disabled={ticket.status === "RESOLVED"}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                解決済にする
              </button>
              <button
                onClick={() => void handleUpdateStatus("CLOSED")}
                disabled={ticket.status === "CLOSED"}
                className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-950 disabled:opacity-50 col-span-2"
              >
                対応完了（クローズ）にする
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
