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
    <section className="rounded-2xl border border-emergency-100 bg-white p-5 shadow-sm dark:border-emergency-900 dark:bg-slate-800">
      <p className="inline-flex rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white">救急モード</p>
      <p className="mt-3 text-sm font-semibold text-emergency-700 dark:text-emergency-400">Emergency Pet Pass</p>
      <h1 className="mt-1 text-3xl font-black text-slate-900 dark:text-slate-100">{data.petName}</h1>

      {/* Blood Type - Critical for emergency */}
      {data.bloodType && (
        <div className="mt-3 rounded-xl border-l-4 border-rose-600 bg-rose-50 p-3 dark:bg-rose-950">
          <p className="text-sm font-bold text-rose-700 dark:text-rose-400">
            🩸 血液型: <span className="text-base font-black text-slate-900 dark:text-slate-100">{data.bloodType}</span>
          </p>
        </div>
      )}

      {/* Insurance Information */}
      {(data.insuranceCompany || data.insurancePolicyNumber) && (
        <div className="mt-3 rounded-xl border-l-4 border-emerald-600 bg-emerald-50 p-4 dark:bg-emerald-950">
          <h2 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">🛡️ 保険情報</h2>
          {data.insuranceCompany && (
            <p className="mt-2 text-base font-bold text-slate-900 dark:text-slate-100">
              保険会社: {data.insuranceCompany}
            </p>
          )}
          {data.insurancePolicyNumber && (
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
              証券番号: {data.insurancePolicyNumber}
            </p>
          )}
        </div>
      )}

      {/* Disease and Allergy - Highest Priority */}
      <div className="mt-4 rounded-xl border-l-4 border-rose-600 bg-rose-50 p-4 dark:bg-rose-950">
        <h2 className="text-sm font-bold text-rose-700 dark:text-rose-400">⚠️ 持病・既往歴</h2>
        <p className="mt-2 text-lg font-black text-slate-900 dark:text-slate-100">{data.disease ?? "登録なし"}</p>
      </div>

      <div className="mt-3 rounded-xl border-l-4 border-rose-600 bg-rose-50 p-4 dark:bg-rose-950">
        <h2 className="text-sm font-bold text-rose-700 dark:text-rose-400">⛔ アレルギー</h2>
        <p className="mt-2 text-lg font-black text-slate-900 dark:text-slate-100">{data.allergy ?? "登録なし"}</p>
      </div>

      {/* Current Medications - High Priority */}
      {data.medications && (
        <div className="mt-3 rounded-xl border-l-4 border-emergency-600 bg-emergency-50 p-4 dark:bg-emergency-950">
          <h2 className="text-sm font-bold text-emergency-700 dark:text-emergency-400">💊 現在の投薬</h2>
          <p className="mt-2 text-lg font-black text-slate-900 dark:text-slate-100">{data.medications}</p>
        </div>
      )}

      {/* Emergency Contacts - High Priority */}
      <div className="mt-5 space-y-3">
        {emergencyPhoneHref ? (
          <a
            href={emergencyPhoneHref}
            className="block rounded-xl bg-rose-600 px-4 py-5 text-center text-lg font-black text-white shadow-lg"
          >
            📞 緊急連絡先1: {priorityContact}
          </a>
        ) : null}
        {emergencyPhoneHref2 ? (
          <a
            href={emergencyPhoneHref2}
            className="block rounded-xl bg-rose-600 px-4 py-5 text-center text-lg font-black text-white shadow-lg"
          >
            📞 緊急連絡先2: {priorityContact2}
          </a>
        ) : null}
      </div>

      {/* Vet Information - High Priority */}
      <div className="mt-5 space-y-3">
        {vetPhoneHref ? (
          <a
            href={vetPhoneHref}
            className="block rounded-xl bg-emergency-600 px-4 py-5 text-center text-lg font-black text-white shadow-lg"
          >
            🏥 かかりつけ病院: {data.vetName}
          </a>
        ) : null}
        {vetMapHref && data.vetName ? (
          <a
            href={vetMapHref}
            target="_blank"
            rel="noreferrer"
            className="block rounded-xl border-2 border-emergency-300 bg-emergency-50 px-4 py-5 text-center text-lg font-black text-emergency-800 dark:border-emergency-700 dark:bg-emergency-950 dark:text-emergency-300"
          >
            🗺️ かかりつけ病院を地図で開く
          </a>
        ) : null}
      </div>

      {/* Emergency Vet - High Priority */}
      {data.emergencyVetName && (
        <div className="mt-5 space-y-3">
          {emergencyVetPhoneHref ? (
            <a
              href={emergencyVetPhoneHref}
              className="block rounded-xl bg-emergency-600 px-4 py-5 text-center text-lg font-black text-white shadow-lg"
            >
              🏥 夜間救急病院: {data.emergencyVetName}
            </a>
          ) : (
            <div className="rounded-xl bg-emergency-50 px-4 py-5 text-center text-lg font-black text-emergency-800 dark:bg-emergency-950 dark:text-emergency-300">
              🏥 夜間救急病院: {data.emergencyVetName}
            </div>
          )}
          {emergencyVetMapHref ? (
            <a
              href={emergencyVetMapHref}
              target="_blank"
              rel="noreferrer"
              className="block rounded-xl border-2 border-emergency-300 bg-emergency-50 px-4 py-5 text-center text-lg font-black text-emergency-800 dark:border-emergency-700 dark:bg-emergency-950 dark:text-emergency-300"
            >
              🗺️ 夜間救急病院を地図で開く
            </a>
          ) : null}
        </div>
      )}

      {/* Additional Information */}
      <div className="mt-5 space-y-3 text-sm dark:text-slate-300">
        <SummaryItems label="直近の投薬" values={data.recentMedicationSummaries} />
        <SummaryItems label="直近のワクチン" values={data.recentVaccinationSummaries} />
        <SummaryItems label="直近の医療記録" values={data.recentMedicalRecordSummaries} />
      </div>

      <p className="mt-4 text-[11px] text-slate-500 dark:text-slate-400">閲覧専用 / Token: {token}</p>
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
    <div className="rounded-lg bg-emergency-50 p-3 dark:bg-emergency-950">
      <p className="text-xs font-bold text-emergency-700 dark:text-emergency-400">{label}</p>
      {values.length === 0 ? (
        <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">登録なし</p>
      ) : (
        <ul className="mt-1 space-y-1">
          {values.map((value, index) => (
            <li className="font-semibold text-slate-900 dark:text-slate-100" key={`${label}-${index}`}>
              {value}
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
