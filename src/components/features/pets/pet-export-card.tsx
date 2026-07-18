"use client";

import { ChangeEvent, useState } from "react";

type PetExportCardProps = {
  petId: string;
};

export function PetExportCard({ petId }: PetExportCardProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isBackupExporting, setIsBackupExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleExportCSV = async () => {
    setIsExporting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      window.location.href = `/api/pets/${petId}/export`;
    } catch {
      setError("CSVエクスポート中にエラーが発生しました。");
    } finally {
      setTimeout(() => {
        setIsExporting(false);
      }, 1500);
    }
  };

  const handleExportJSON = async () => {
    setIsBackupExporting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      window.location.href = `/api/pets/${petId}/backup/export`;
    } catch {
      setError("JSONバックアップのエクスポート中にエラーが発生しました。");
    } finally {
      setTimeout(() => {
        setIsBackupExporting(false);
      }, 1500);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedFile) return;

    setIsRestoring(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const fileText = await selectedFile.text();
      const backupData = JSON.parse(fileText) as object;

      const response = await fetch(`/api/pets/${petId}/backup/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backupData)
      });

      if (!response.ok) {
        throw new Error("Restore failed");
      }

      setSuccessMessage("バックアップから健康データを正常に復元しました！画面を再読み込みしてください。");
      setSelectedFile(null);
    } catch {
      setError("バックアップデータの復元に失敗しました。正しいJSONファイルが指定されているかご確認ください。");
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">健康データのエクスポート</h2>
        <p className="mt-2 text-sm text-slate-600">
          ペットの健康管理データ（医療記録、投薬履歴、ワクチン接種歴、健康指標ログ、検査値）をCSV形式で一括ダウンロードします。
          かかりつけ医への相談やデータ共有用にご活用ください。
        </p>

        <div className="mt-4">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={isExporting}
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {isExporting ? "エクスポート中..." : "CSVファイルを出力"}
          </button>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
        <h2 className="text-base font-bold text-slate-900">データバックアップ & 復元</h2>
        <p className="mt-2 text-sm text-slate-600">
          すべてのデータをJSON形式で書き出したり、書き出したファイルから一括復元できます。
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-700">1. バックアップの作成</h3>
            <button
              type="button"
              onClick={handleExportJSON}
              disabled={isBackupExporting}
              className="mt-2 inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {isBackupExporting ? "作成中..." : "JSONバックアップを出力"}
            </button>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <h3 className="text-xs font-bold text-slate-700">2. バックアップから復元</h3>
            <p className="text-xs text-rose-600 mt-1">※復元を実行すると、現在のペットの健康データは上書き・上書き消去されます。</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
              />
              {selectedFile && (
                <button
                  type="button"
                  onClick={handleRestoreBackup}
                  disabled={isRestoring}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {isRestoring ? "復元中..." : "復元を実行"}
                </button>
              )}
            </div>
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-rose-600">{error}</p>}
        {successMessage && <p className="mt-3 text-xs text-emerald-700">{successMessage}</p>}
      </section>
    </div>
  );
}
