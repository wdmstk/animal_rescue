import React from "react";
import { Badge } from "@/components/ui/badge";

export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";

export interface AiProposalCardProps {
  summary: string;
  reasons?: string[];
  sources?: string[];
  confidenceLevel: ConfidenceLevel;
  confidenceScore?: number; // 0-100
  updatedAt: string; // ISO 8601 string
  disclaimer?: string;
  className?: string;
}

const confidenceConfig: Record<ConfidenceLevel, { label: string; variant: "success" | "warning" | "error" }> = {
  HIGH: { label: "確信度: 高", variant: "success" },
  MEDIUM: { label: "確信度: 中", variant: "warning" },
  LOW: { label: "確信度: 低", variant: "error" }
};

export const AiProposalCard: React.FC<AiProposalCardProps> = ({
  summary,
  reasons = [],
  sources = [],
  confidenceLevel,
  confidenceScore,
  updatedAt,
  disclaimer = "※本提案はAIによる自動分析・抽出結果であり、直接の獣医師による診断に代わるものではありません。",
  className = ""
}) => {
  const confidenceInfo = confidenceConfig[confidenceLevel];
  const formattedDate = new Date(updatedAt).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <article
      className={`rounded-2xl border border-blue-500/20 bg-slate-900/80 p-5 backdrop-blur-md shadow-lg space-y-3 ${className}`}
      aria-label="AI分析提案情報"
    >
      {/* 1. 要約提案 & 確信度 */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">🤖 AI提案・抽出結果</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={confidenceInfo.variant}>
            {confidenceInfo.label} {confidenceScore !== undefined ? `(${confidenceScore}%)` : ""}
          </Badge>
        </div>
      </div>

      <p className="text-sm font-semibold text-slate-100 leading-relaxed">
        {summary}
      </p>

      {/* 2. 提案の根拠 */}
      {reasons.length > 0 && (
        <div className="space-y-1 border-t border-slate-800 pt-2 text-xs">
          <p className="font-semibold text-slate-400">【提案・抽出の根拠】</p>
          <ul className="list-disc list-inside space-y-0.5 text-slate-300">
            {reasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 3. 参照した出典 / ガイドライン */}
      {sources.length > 0 && (
        <div className="space-y-1 text-xs">
          <p className="font-semibold text-slate-400">【参照出典・ガイドライン】</p>
          <div className="flex flex-wrap gap-1.5">
            {sources.map((src, idx) => (
              <span key={idx} className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                {src}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 4. 更新日時 & 5. 免責事項 */}
      <div className="border-t border-slate-800/80 pt-2.5 flex flex-col gap-1 text-[11px] text-slate-400">
        <div className="flex justify-between items-center text-slate-500">
          <span>最終更新: {formattedDate}</span>
        </div>
        <p className="italic text-slate-400">{disclaimer}</p>
      </div>
    </article>
  );
};
