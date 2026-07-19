import type { EmergencyViewPayload } from "@/types/domain";

export function EmergencyPublicView({ token, data }: { token: string; data: EmergencyViewPayload }) {
  const vetPhoneHref = toTelHref(data.vetPhone);
  const emergencyPhoneHref = toTelHref(data.emergencyContactPhone);
  const emergencyPhoneHref2 = toTelHref(data.emergencyContactPhone2);
  const emergencyVetPhoneHref = toTelHref(data.emergencyVetPhone);
  const vetMapHref = buildMapLink(data.vetName);
  const emergencyVetMapHref = buildMapLink(data.emergencyVetName);
  const priorityContact = joinLabel(data.emergencyContactName, data.emergencyContactPhone);
  const priorityContact2 = joinLabel(data.emergencyContactName2, data.emergencyContactPhone2);

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl text-white relative overflow-hidden transition-all duration-300 hover:border-white/20">
      {/* Decorative top gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-amber-500" />

      {/* Header section with status badges */}
      <div className="flex items-center justify-between gap-4 mt-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/30 px-3 py-1 text-xs font-bold text-red-400 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          救急モード
        </span>
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Emergency Pet Pass
        </span>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          {data.petName}
        </h1>
        {data.bloodType && (
          <span className="inline-block rounded-lg bg-red-500/20 border border-red-500/30 px-2.5 py-1 text-xs font-bold text-red-400">
            🩸 血液型: {data.bloodType}
          </span>
        )}
      </div>

      {/* Insurance Information (Premium Style) */}
      {(data.insuranceCompany || data.insurancePolicyNumber) && (
        <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 transition-all hover:bg-emerald-500/10">
          <h2 className="text-xs font-bold text-emerald-400 tracking-wider uppercase">🛡️ 保険情報</h2>
          <div className="mt-2 space-y-1">
            {data.insuranceCompany && (
              <p className="text-base font-bold text-white">
                {data.insuranceCompany}
              </p>
            )}
            {data.insurancePolicyNumber && (
              <p className="text-xs text-slate-400">
                証券番号: {data.insurancePolicyNumber}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Health Conditions / Allergies */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 transition-all hover:bg-rose-500/10">
          <h2 className="text-xs font-bold text-rose-400 tracking-wider uppercase">⚠️ 持病・既往歴</h2>
          <p className="mt-2 text-base font-bold text-white leading-snug">{data.disease ?? "登録なし"}</p>
        </div>

        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 transition-all hover:bg-rose-500/10">
          <h2 className="text-xs font-bold text-rose-400 tracking-wider uppercase">⛔ アレルギー</h2>
          <p className="mt-2 text-base font-bold text-white leading-snug">{data.allergy ?? "登録なし"}</p>
        </div>
      </div>

      {/* Current Medications */}
      {data.medications && (
        <div className="mt-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 transition-all hover:bg-amber-500/10">
          <h2 className="text-xs font-bold text-amber-400 tracking-wider uppercase">💊 現在の投薬</h2>
          <p className="mt-2 text-base font-bold text-white leading-snug">{data.medications}</p>
        </div>
      )}

      {/* Action Buttons - Emergency Contacts (Vivid Primary Action) */}
      <div className="mt-6 space-y-3">
        {emergencyPhoneHref ? (
          <a
            href={emergencyPhoneHref}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 px-4 py-4 text-center text-base font-bold text-white shadow-lg shadow-red-900/30 transition-all hover:opacity-95 active:scale-98"
          >
            <span>📞</span> 緊急連絡先1: {priorityContact}
          </a>
        ) : null}
        {emergencyPhoneHref2 ? (
          <a
            href={emergencyPhoneHref2}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 px-4 py-4 text-center text-base font-bold text-white shadow-lg shadow-red-900/30 transition-all hover:opacity-95 active:scale-98"
          >
            <span>📞</span> 緊急連絡先2: {priorityContact2}
          </a>
        ) : null}
      </div>

      {/* Vet Hospital Contacts */}
      <div className="mt-5 space-y-3">
        {vetPhoneHref ? (
          <a
            href={vetPhoneHref}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 px-4 py-4 text-center text-base font-bold text-white shadow-lg shadow-blue-900/30 transition-all hover:opacity-95 active:scale-98"
          >
            <span>🏥</span> かかりつけ病院: {data.vetName}
          </a>
        ) : null}
        {vetMapHref && data.vetName ? (
          <a
            href={vetMapHref}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center text-sm font-semibold text-slate-300 transition-all hover:bg-white/10 active:scale-98"
          >
            <span>🗺️</span> かかりつけ病院を地図で開く
          </a>
        ) : null}
      </div>

      {/* Emergency Vet Contacts */}
      {data.emergencyVetName && (
        <div className="mt-5 space-y-3">
          {emergencyVetPhoneHref ? (
            <a
              href={emergencyVetPhoneHref}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 px-4 py-4 text-center text-base font-bold text-white shadow-lg shadow-blue-900/30 transition-all hover:opacity-95 active:scale-98"
            >
              <span>🏥</span> 夜間救急病院: {data.emergencyVetName}
            </a>
          ) : (
            <div className="rounded-2xl border border-white/5 bg-slate-900 px-4 py-4 text-center text-base font-bold text-slate-400">
              🏥 夜間救急病院: {data.emergencyVetName}
            </div>
          )}
          {emergencyVetMapHref ? (
            <a
              href={emergencyVetMapHref}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center text-sm font-semibold text-slate-300 transition-all hover:bg-white/10 active:scale-98"
            >
              <span>🗺️</span> 夜間救急病院を地図で開く
            </a>
          ) : null}
        </div>
      )}

      {/* Additional Historical Summaries (Refined layout) */}
      <div className="mt-6 space-y-3">
        <SummaryItems label="直近の投薬" values={data.recentMedicationSummaries} />
        <SummaryItems label="直近のワクチン" values={data.recentVaccinationSummaries} />
        <SummaryItems label="直近の医療記録" values={data.recentMedicalRecordSummaries} />
      </div>

      <p className="mt-6 text-center text-[10px] text-slate-500 font-mono">
        閲覧専用 / Token: {token}
      </p>
    </section>
  );
}

const joinLabel = (name: string | null, phone: string | null): string | null => {
  if (!name && !phone) {
    return null;
  }

  return [name, phone].filter(Boolean).join(" ");
};

const SummaryItems = ({ label, values }: { label: string; values?: string[] }) => {
  if (!values) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-4 transition-all hover:bg-slate-950/60">
      <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">{label}</p>
      {values.length === 0 ? (
        <p className="mt-1 text-sm font-medium text-slate-500">登録なし</p>
      ) : (
        <ul className="mt-2 space-y-1 text-sm font-semibold text-slate-200">
          {values.map((value, index) => (
            <li className="flex items-start gap-2" key={`${label}-${index}`}>
              <span className="text-slate-500">•</span>
              <span>{value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const toTelHref = (value: string | null): string | null => {
  if (!value) {
    return null;
  }

  const numeric = value.replace(/[^\d+]/g, "");
  const digitCount = numeric.replace(/\D/g, "").length;
  if (!numeric || digitCount < 10 || digitCount > 15) {
    return null;
  }

  return `tel:${numeric}`;
};

const buildMapLink = (vetName: string | null): string | null => {
  if (!vetName) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vetName)}`;
};
