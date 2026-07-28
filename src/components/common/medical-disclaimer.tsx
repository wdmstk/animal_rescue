import React from "react";

interface MedicalDisclaimerProps {
  className?: string;
  variant?: "card" | "banner" | "inline";
}

export const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({
  className = "",
  variant = "card"
}) => {
  if (variant === "banner") {
    return (
      <div className={`rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300 backdrop-blur-sm ${className}`}>
        <p className="font-semibold flex items-center gap-1.5">
          <span>⚠️ 医療上のご注意</span>
        </p>
        <p className="mt-1 text-slate-300">
          本機能による抽出結果やAI解説・問診サマリーは医療判断を提供するものではありません。ペットの症状・診断・処方については、必ず獣医師の指示に従ってください。
        </p>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <p className={`text-xs text-slate-400 italic ${className}`}>
        ※本機能のAI/OCR抽出・サマリーは医療診断ではありません。最終判断は必ず獣医師にご相談ください。
      </p>
    );
  }

  return (
    <div className={`rounded-xl border border-slate-700/60 bg-slate-900/60 p-4 text-xs text-slate-300 shadow-sm backdrop-blur-md ${className}`}>
      <div className="flex items-start gap-2.5">
        <span className="text-base select-none">🩺</span>
        <div className="space-y-1">
          <h4 className="font-semibold text-slate-200">免責事項・ご利用にあたって</h4>
          <p className="text-slate-400 leading-relaxed">
            本機能で提供されるOCRテキスト抽出結果およびAI問診・サマリーは、データ整理を支援するためのものであり、**確定的な医療判断・診断・処方を行うものではありません**。
            緊急時や診断の確認が必要な場合は、必ずかかりつけ動物病院の獣医師へご相談・提示してください。
          </p>
        </div>
      </div>
    </div>
  );
};
