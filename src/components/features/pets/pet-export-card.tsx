"use client";

import { useState } from "react";

type PetExportCardProps = {
  petId: string;
};

export function PetExportCard({ petId }: PetExportCardProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    try {
      // Trigger native download
      window.location.href = `/api/pets/${petId}/export`;
    } catch {
      setError("エクスポート中にエラーが発生しました。");
    } finally {
      // Small timeout to let download start
      setTimeout(() => {
        setIsExporting(false);
      }, 1500);
    }
  };

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">健康データのエクスポート</h2>
      <p className="mt-2 text-sm text-slate-600">
        ペットの健康管理データ（医療記録、投薬履歴、ワクチン接種歴、健康指標ログ、検査値）をCSV形式で一括ダウンロードします。
        かかりつけ医への相談やデータバックアップ用にご活用ください。
      </p>

      <div className="mt-4">
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {isExporting ? "エクスポート中..." : "CSVファイルを出力"}
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
    </section>
  );
}
