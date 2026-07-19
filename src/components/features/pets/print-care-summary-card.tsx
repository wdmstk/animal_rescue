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
};

const normalizeLabel = (value: string | null) => (value && value.trim().length > 0 ? value : "未登録");

export function PrintCareSummaryCard({ pet, emergencyInfo, medications }: PrintCareSummaryCardProps) {
  return (
    <section className="print-care-summary rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900/60 dark:border dark:border-white/10 dark:text-slate-100 dark:backdrop-blur-md">
      <div className="no-print flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">通院提出用サマリー（印刷/PDF）</h2>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 dark:bg-white/5 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
        >
          印刷/PDF出力
        </button>
      </div>

      <div className="mt-3 space-y-3 text-sm">
        <section>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">基本情報</h3>
          <p>{pet.name} / {pet.species}{pet.breed ? ` / ${pet.breed}` : ""}</p>
          <p>性別: {pet.sex}</p>
          <p>誕生日: {normalizeLabel(pet.birthday)}</p>
          <p>年齢: {pet.ageYears !== null ? `${pet.ageYears}歳` : "未登録"}</p>
          <p>体重: {pet.weightKg !== null ? `${pet.weightKg}kg` : "未登録"}</p>
        </section>

        <section>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">緊急情報</h3>
          <p>持病: {normalizeLabel(emergencyInfo?.disease ?? null)}</p>
          <p>アレルギー: {normalizeLabel(emergencyInfo?.allergy ?? null)}</p>
          <p>現在の投薬メモ: {normalizeLabel(emergencyInfo?.currentMedications ?? null)}</p>
          <p>かかりつけ: {normalizeLabel(emergencyInfo?.vetName ?? null)} {emergencyInfo?.vetPhone ? `(${emergencyInfo.vetPhone})` : ""}</p>
          <p>緊急連絡先: {normalizeLabel(emergencyInfo?.emergencyContactName ?? null)} {emergencyInfo?.emergencyContactPhone ? `(${emergencyInfo.emergencyContactPhone})` : ""}</p>
        </section>

        <section>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">投薬一覧</h3>
          {medications.length === 0 ? (
            <p>登録なし</p>
          ) : (
            <ul className="list-disc pl-5">
              {medications.map((item, index) => (
                <li key={`${item.name}-${index}`}>
                  {item.name} / {item.dosage} / {item.frequency}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  );
}
