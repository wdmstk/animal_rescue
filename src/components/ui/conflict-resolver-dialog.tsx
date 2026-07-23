"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";

export type ConflictField = {
  key: string;
  label: string;
  serverValue: string | number | null;
  localValue: string | number | null;
};

export interface ConflictResolverDialogProps {
  isOpen: boolean;
  title?: string;
  entityName?: string;
  serverUpdatedAt?: string;
  localUpdatedAt?: string;
  fields: ConflictField[];
  onKeepServer: () => void;
  onUseLocal: () => void;
  onClose: () => void;
}

export const ConflictResolverDialog: React.FC<ConflictResolverDialogProps> = ({
  isOpen,
  title = "データ同期競合の検出",
  entityName = "ペット情報",
  serverUpdatedAt,
  localUpdatedAt,
  fields,
  onKeepServer,
  onUseLocal,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="conflict-dialog-title"
      className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all"
    >
      <div className="w-full max-w-lg rounded-2xl border border-amber-500/30 bg-slate-900 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Badge variant="warning">データ競合</Badge>
            <h3 id="conflict-dialog-title" className="text-base font-bold text-slate-100">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ダイアログを閉じる"
            className="text-slate-400 hover:text-slate-200 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          オフライン中に変更された【{entityName}】と、サーバー上の最新データに差異が存在します。上書きされる旧データは監査ログ (AuditLog) に自動保存されます。
        </p>

        {/* 差分比較テーブル */}
        <div className="rounded-xl border border-slate-800 overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                <th className="p-2.5 font-semibold">項目</th>
                <th className="p-2.5 font-semibold text-blue-300">サーバーデータ (最新)</th>
                <th className="p-2.5 font-semibold text-amber-300">ローカルデータ (未同期)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {fields.map((field) => {
                const isDifferent = String(field.serverValue) !== String(field.localValue);
                return (
                  <tr
                    key={field.key}
                    className={isDifferent ? "bg-amber-500/5 hover:bg-amber-500/10" : ""}
                  >
                    <td className="p-2.5 font-medium text-slate-400">{field.label}</td>
                    <td className="p-2.5 text-blue-200">{String(field.serverValue ?? "なし")}</td>
                    <td className="p-2.5 text-amber-200">{String(field.localValue ?? "なし")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 更新日時表示 */}
        <div className="flex justify-between text-[11px] text-slate-500 pt-1">
          <span>サーバー更新: {serverUpdatedAt ? new Date(serverUpdatedAt).toLocaleString("ja-JP") : "不明"}</span>
          <span>ローカル保存: {localUpdatedAt ? new Date(localUpdatedAt).toLocaleString("ja-JP") : "不明"}</span>
        </div>

        {/* アクションボタン (CTA) */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onKeepServer}
            className="flex-1 px-4 py-2.5 rounded-xl border border-blue-500/40 bg-blue-950/40 text-blue-200 hover:bg-blue-900/50 text-xs font-bold transition-colors"
          >
            サーバー側の最新データを維持
          </button>
          <button
            type="button"
            onClick={onUseLocal}
            className="flex-1 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold transition-colors shadow-lg shadow-amber-950/40"
          >
            ローカルの変更で上書き保存
          </button>
        </div>
      </div>
    </div>
  );
};
