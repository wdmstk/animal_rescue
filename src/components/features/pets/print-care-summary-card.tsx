"use client";

type PrintCareSummaryCardProps = {
  pet: {
    name: string;
    species: string;
    breed: string | null;
    sex: string;
    birthday: string | null;
    ageYears: number | null;
    weightKg: number | null;
  };
  emergencyInfo: {
    disease: string | null;
    allergy: string | null;
    currentMedications: string | null;
    vetName: string | null;
    vetPhone: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
  } | null;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
  vaccinations?: Array<{
    type: string;
    date: string;
    nextDue: string | null;
  }>;
  medicalRecords?: Array<{
    date: string;
    title: string;
    description: string;
  }>;
};

const normalizeLabel = (value: string | null) => (value && value.trim().length > 0 ? value : "未登録");

export function PrintCareSummaryCard({
  pet,
  emergencyInfo,
  medications,
  vaccinations = [],
  medicalRecords = []
}: PrintCareSummaryCardProps) {
  return (
    <section className="print-care-summary rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md text-white">
      <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/50 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            🖨️ 通院・救急提出用サマリー（全項目統合シート）
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            動物病院受診や緊急預かり時にこのまま印刷・PDF出力して渡せる総合サマリーです。
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow hover:opacity-95 transition-all"
        >
          🖨️ 印刷 / PDF保存
        </button>
      </div>

      <div className="print-header hidden print:block mb-4 pb-2 border-b border-black">
        <h1 className="text-xl font-bold text-black">{pet.name} の健康・診療カルテ（通院用提出サマリー）</h1>
        <p className="text-xs text-black">出力日: {new Date().toLocaleDateString("ja-JP")}</p>
      </div>

      <div className="mt-4 space-y-4 text-sm text-slate-200 print:text-black print:space-y-3">
        {/* 🐾 基本プロフィール */}
        <section className="rounded-xl border border-white/10 bg-slate-950/40 p-4 print:border-black print:bg-transparent">
          <h3 className="font-bold text-teal-400 border-b border-slate-700/50 pb-1.5 text-base print:text-black print:border-black flex items-center gap-2">
            🐾 基本プロフィール
          </h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3 text-xs">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5 print:border-slate-300 print:bg-transparent">
              <span className="text-slate-400 block print:text-slate-700 font-medium">名前 / 種類</span>
              <span className="font-bold text-white print:text-black text-sm">{pet.name}（{pet.species}{pet.breed ? ` / ${pet.breed}` : ""}）</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5 print:border-slate-300 print:bg-transparent">
              <span className="text-slate-400 block print:text-slate-700 font-medium">性別</span>
              <span className="font-bold text-white print:text-black text-sm">{pet.sex}</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5 print:border-slate-300 print:bg-transparent">
              <span className="text-slate-400 block print:text-slate-700 font-medium">生年月日</span>
              <span className="font-bold text-white print:text-black text-sm">{normalizeLabel(pet.birthday)}</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5 print:border-slate-300 print:bg-transparent">
              <span className="text-slate-400 block print:text-slate-700 font-medium">年齢 / 体重</span>
              <span className="font-bold text-white print:text-black text-sm">{pet.ageYears !== null ? `${pet.ageYears}歳` : "未登録"} / {pet.weightKg !== null ? `${pet.weightKg}kg` : "未登録"}</span>
            </div>
          </div>
        </section>

        {/* 🚨 持病・アレルギー・緊急情報 */}
        <section className="rounded-xl border border-white/10 bg-slate-950/40 p-4 print:border-black print:bg-transparent">
          <h3 className="font-bold text-rose-400 border-b border-slate-700/50 pb-1.5 text-base print:text-black print:border-black flex items-center gap-2">
            🚨 持病・アレルギー・緊急情報
          </h3>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2 text-xs">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5 print:border-slate-300 print:bg-transparent">
              <span className="text-slate-400 block print:text-slate-700 font-medium">持病・既往症</span>
              <span className="font-bold text-rose-300 print:text-black text-sm">{normalizeLabel(emergencyInfo?.disease ?? null)}</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5 print:border-slate-300 print:bg-transparent">
              <span className="text-slate-400 block print:text-slate-700 font-medium">アレルギー</span>
              <span className="font-bold text-amber-300 print:text-black text-sm">{normalizeLabel(emergencyInfo?.allergy ?? null)}</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5 print:border-slate-300 print:bg-transparent">
              <span className="text-slate-400 block print:text-slate-700 font-medium">かかりつけ病院</span>
              <span className="font-bold text-white print:text-black text-sm">{normalizeLabel(emergencyInfo?.vetName ?? null)} {emergencyInfo?.vetPhone ? `(${emergencyInfo.vetPhone})` : ""}</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5 print:border-slate-300 print:bg-transparent">
              <span className="text-slate-400 block print:text-slate-700 font-medium">緊急連絡先</span>
              <span className="font-bold text-white print:text-black text-sm">{normalizeLabel(emergencyInfo?.emergencyContactName ?? null)} {emergencyInfo?.emergencyContactPhone ? `(${emergencyInfo.emergencyContactPhone})` : ""}</span>
            </div>
          </div>
        </section>

        {/* 💊 現在の投薬一覧 */}
        <section className="rounded-xl border border-white/10 bg-slate-950/40 p-4 print:border-black print:bg-transparent">
          <h3 className="font-bold text-blue-400 border-b border-slate-700/50 pb-1.5 text-base print:text-black print:border-black flex items-center gap-2">
            💊 現在の投薬一覧
          </h3>
          {medications.length === 0 ? (
            <p className="text-xs text-slate-400 mt-2 print:text-black">登録中の投薬はありません。</p>
          ) : (
            <ul className="mt-2.5 space-y-1.5 text-xs">
              {medications.map((item, index) => (
                <li key={`${item.name}-${index}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-900/80 p-2.5 border border-white/5 print:border-slate-300 print:bg-transparent">
                  <span className="font-bold text-white print:text-black text-sm">{item.name}</span>
                  <span className="text-slate-300 print:text-black font-medium">用量: {item.dosage} / 頻度: {item.frequency}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 💉 ワクチン・予防履歴 */}
        {vaccinations.length > 0 && (
          <section className="rounded-xl border border-white/10 bg-slate-950/40 p-4 print:border-black print:bg-transparent">
            <h3 className="font-bold text-emerald-400 border-b border-slate-700/50 pb-1.5 text-base print:text-black print:border-black flex items-center gap-2">
              💉 ワクチン・予防履歴
            </h3>
            <ul className="mt-2.5 space-y-1.5 text-xs">
              {vaccinations.slice(0, 5).map((v, i) => (
                <li key={i} className="flex justify-between items-center rounded-lg bg-slate-900/60 p-2 border border-white/5 print:border-slate-300 print:bg-transparent">
                  <span className="font-semibold text-white print:text-black">{v.type} （接種日: {v.date}）</span>
                  <span className="text-slate-300 print:text-black font-medium">次回予定: {v.nextDue ?? "未設定"}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 📋 直近の診療・検査記録 */}
        {medicalRecords.length > 0 && (
          <section className="rounded-xl border border-white/10 bg-slate-950/40 p-4 print:border-black print:bg-transparent">
            <h3 className="font-bold text-purple-400 border-b border-slate-700/50 pb-1.5 text-base print:text-black print:border-black flex items-center gap-2">
              📋 直近の診療・検査記録
            </h3>
            <ul className="mt-2.5 space-y-2 text-xs">
              {medicalRecords.slice(0, 3).map((r, i) => (
                <li key={i} className="rounded-lg bg-slate-900/60 p-2.5 border border-white/5 print:border-slate-300 print:bg-transparent">
                  <span className="font-bold text-white print:text-black text-sm block mb-1">{r.date} - {r.title}</span>
                  <p className="text-slate-300 print:text-black whitespace-pre-wrap">{r.description}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </section>
  );
}
