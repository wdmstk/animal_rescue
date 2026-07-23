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

      <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm text-slate-200 print:text-black print:grid-cols-2">
        <section className="rounded-xl border border-white/10 bg-slate-950/40 p-4 print:border-black print:bg-transparent">
          <h3 className="font-bold text-teal-400 border-b border-slate-700/50 pb-1 text-base print:text-black print:border-black">🐾 基本プロフィール</h3>
          <dl className="mt-2 space-y-1 text-xs">
            <div className="flex justify-between"><dt className="text-slate-400 print:text-black">名前 / 種類:</dt><dd className="font-semibold text-white print:text-black">{pet.name}（{pet.species}{pet.breed ? ` / ${pet.breed}` : ""}）</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400 print:text-black">性別:</dt><dd className="font-semibold text-white print:text-black">{pet.sex}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400 print:text-black">生年月日:</dt><dd className="font-semibold text-white print:text-black">{normalizeLabel(pet.birthday)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400 print:text-black">年齢 / 体重:</dt><dd className="font-semibold text-white print:text-black">{pet.ageYears !== null ? `${pet.ageYears}歳` : "未登録"} / {pet.weightKg !== null ? `${pet.weightKg}kg` : "未登録"}</dd></div>
          </dl>
        </section>

        <section className="rounded-xl border border-white/10 bg-slate-950/40 p-4 print:border-black print:bg-transparent">
          <h3 className="font-bold text-rose-400 border-b border-slate-700/50 pb-1 text-base print:text-black print:border-black">🚨 持病・アレルギー・緊急情報</h3>
          <dl className="mt-2 space-y-1 text-xs">
            <div className="flex justify-between"><dt className="text-slate-400 print:text-black">持病・既往症:</dt><dd className="font-bold text-rose-300 print:text-black">{normalizeLabel(emergencyInfo?.disease ?? null)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400 print:text-black">アレルギー:</dt><dd className="font-bold text-amber-300 print:text-black">{normalizeLabel(emergencyInfo?.allergy ?? null)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400 print:text-black">かかりつけ病院:</dt><dd className="font-semibold text-white print:text-black">{normalizeLabel(emergencyInfo?.vetName ?? null)} {emergencyInfo?.vetPhone ? `(${emergencyInfo.vetPhone})` : ""}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400 print:text-black">緊急連絡先:</dt><dd className="font-semibold text-white print:text-black">{normalizeLabel(emergencyInfo?.emergencyContactName ?? null)} {emergencyInfo?.emergencyContactPhone ? `(${emergencyInfo.emergencyContactPhone})` : ""}</dd></div>
          </dl>
        </section>

        <section className="rounded-xl border border-white/10 bg-slate-950/40 p-4 md:col-span-2 print:border-black print:bg-transparent">
          <h3 className="font-bold text-blue-400 border-b border-slate-700/50 pb-1 text-base print:text-black print:border-black">💊 現在の投薬一覧</h3>
          {medications.length === 0 ? (
            <p className="text-xs text-slate-400 mt-2 print:text-black">登録中の投薬はありません。</p>
          ) : (
            <ul className="mt-2 grid gap-1.5 text-xs md:grid-cols-2">
              {medications.map((item, index) => (
                <li key={`${item.name}-${index}`} className="rounded bg-slate-900/80 p-2 border border-white/5 print:border-black print:bg-transparent">
                  <span className="font-bold text-white print:text-black">{item.name}</span>
                  <span className="ml-2 text-slate-300 print:text-black">({item.dosage} / {item.frequency})</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {vaccinations.length > 0 && (
          <section className="rounded-xl border border-white/10 bg-slate-950/40 p-4 print:border-black print:bg-transparent">
            <h3 className="font-bold text-emerald-400 border-b border-slate-700/50 pb-1 text-base print:text-black print:border-black">💉 ワクチン・予防履歴</h3>
            <ul className="mt-2 space-y-1 text-xs">
              {vaccinations.slice(0, 5).map((v, i) => (
                <li key={i} className="flex justify-between border-b border-white/5 pb-1 print:border-black">
                  <span>{v.type} ({v.date})</span>
                  <span className="text-slate-400 print:text-black">次回: {v.nextDue ?? "未設定"}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {medicalRecords.length > 0 && (
          <section className="rounded-xl border border-white/10 bg-slate-950/40 p-4 print:border-black print:bg-transparent">
            <h3 className="font-bold text-purple-400 border-b border-slate-700/50 pb-1 text-base print:text-black print:border-black">📋 直近の診療・検査記録</h3>
            <ul className="mt-2 space-y-1.5 text-xs">
              {medicalRecords.slice(0, 3).map((r, i) => (
                <li key={i} className="border-b border-white/5 pb-1 print:border-black">
                  <span className="font-bold text-white print:text-black">{r.date} - {r.title}</span>
                  <p className="text-slate-400 print:text-black truncate">{r.description}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </section>
  );
}
