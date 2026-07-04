import type { EmergencyViewPayload } from "@/types/domain";

export function EmergencyPublicView({ token, data }: { token: string; data: EmergencyViewPayload }) {
  const vetPhoneHref = toTelHref(data.vetPhone);
  const emergencyPhoneHref = toTelHref(data.emergencyContactPhone);
  const vetMapHref = buildMapLink(data.vetName);
  const priorityContact = joinLabel(data.emergencyContactName, data.emergencyContactPhone);

  return (
    <section className="rounded-2xl border border-emergency-100 bg-white p-5 shadow-sm dark:border-emergency-900 dark:bg-slate-800">
      <p className="inline-flex rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white">救急モード</p>
      <p className="mt-3 text-sm font-semibold text-emergency-700 dark:text-emergency-400">Emergency Pet Pass</p>
      <h1 className="mt-1 text-3xl font-black text-slate-900 dark:text-slate-100">{data.petName}</h1>

      <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-950">
        <h2 className="text-sm font-bold text-rose-700 dark:text-rose-400">最優先情報</h2>
        <div className="mt-3 space-y-3">
          <PriorityItem label="薬" value={data.medications} />
          <PriorityItem label="アレルギー" value={data.allergy} />
          <PriorityItem label="連絡先" value={priorityContact} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2">
        {emergencyPhoneHref ? (
          <a
            href={emergencyPhoneHref}
            className="rounded-lg bg-rose-600 px-4 py-4 text-center text-base font-bold text-white"
          >
            緊急連絡先へ電話
          </a>
        ) : null}
        {vetPhoneHref ? (
          <a
            href={vetPhoneHref}
            className="rounded-lg bg-emergency-600 px-4 py-4 text-center text-base font-bold text-white"
          >
            病院へ電話
          </a>
        ) : null}
        {vetMapHref ? (
          <a
            href={vetMapHref}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-emergency-200 bg-emergency-50 px-4 py-4 text-center text-base font-bold text-emergency-800 dark:border-emergency-800 dark:bg-emergency-950 dark:text-emergency-300"
          >
            病院を地図で開く
          </a>
        ) : null}
      </div>

      <div className="mt-5 space-y-3 text-sm dark:text-slate-300">
        <Item label="薬" value={data.medications} />
        <Item label="連絡先" value={priorityContact} />
        <Item label="アレルギー" value={data.allergy} />
        <Item label="持病" value={data.disease} />
        <Item label="病院" value={joinLabel(data.vetName, data.vetPhone)} />
        <SummaryItems label="直近の投薬" values={data.recentMedicationSummaries} />
        <SummaryItems label="直近のワクチン" values={data.recentVaccinationSummaries} />
        <SummaryItems label="直近の医療記録" values={data.recentMedicalRecordSummaries} />
      </div>

      <p className="mt-4 text-[11px] text-slate-500 dark:text-slate-400">閲覧専用 / Token: {token}</p>
    </section>
  );
}

const PriorityItem = ({ label, value }: { label: string; value: string | null }) => (
  <div className="rounded-lg bg-white p-3 dark:bg-slate-700">
    <p className="text-xs font-bold text-rose-700 dark:text-rose-400">{label}</p>
    <p className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">{value ?? "登録なし"}</p>
  </div>
);

const Item = ({ label, value }: { label: string; value: string | null }) => (
  <div className="rounded-lg bg-emergency-50 p-3 dark:bg-emergency-950">
    <p className="text-xs font-bold text-emergency-700 dark:text-emergency-400">{label}</p>
    <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{value ?? "登録なし"}</p>
  </div>
);

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
    <div className="rounded-lg bg-emergency-50 p-3">
      <p className="text-xs font-bold text-emergency-700">{label}</p>
      {values.length === 0 ? (
        <p className="mt-1 font-semibold text-slate-900">登録なし</p>
      ) : (
        <ul className="mt-1 space-y-1">
          {values.map((value, index) => (
            <li className="font-semibold text-slate-900" key={`${label}-${index}`}>
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
