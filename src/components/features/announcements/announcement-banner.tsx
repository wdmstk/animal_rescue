"use client";

import { useEffect, useState } from "react";

type Announcement = {
  id: string;
  title: string;
  body: string;
  publishedAt: string | null;
};

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadAnnouncements() {
      try {
        const res = await fetch("/api/announcements");
        if (!res.ok) return;
        const json = await res.json();
        if (active && json.success && Array.isArray(json.data)) {
          setAnnouncements(json.data);
        }
      } catch {
        // silent fallback
      }
    }
    void loadAnnouncements();
    return () => {
      active = false;
    };
  }, []);

  if (announcements.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {announcements.map((item) => {
        const isExpanded = expandedId === item.id;
        return (
          <div
            key={item.id}
            className="rounded-2xl border border-teal-500/30 bg-gradient-to-r from-slate-900/90 to-teal-950/40 p-4 shadow-xl backdrop-blur-md transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex rounded-full bg-teal-500/20 border border-teal-400/40 px-2.5 py-0.5 text-[10px] font-bold text-teal-300">
                    📢 運営お知らせ
                  </span>
                  {item.publishedAt && (
                    <span className="text-[11px] text-slate-400">
                      {new Date(item.publishedAt).toLocaleDateString("ja-JP")}
                    </span>
                  )}
                </div>
                <h3 className="mt-1.5 text-sm font-bold text-white flex items-center gap-2">
                  {item.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="rounded-lg border border-white/10 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700"
              >
                {isExpanded ? "閉じる" : "詳細を見る"}
              </button>
            </div>

            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-white/10 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                {item.body}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
