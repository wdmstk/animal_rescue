type EmergencyCardProps = {
  disease: string;
  medications: string;
  allergy: string;
  vet: string;
  contact: string;
  insuranceCompany?: string | null;
  insurancePolicyNumber?: string | null;
};

export function EmergencyCard({
  disease,
  medications,
  allergy,
  vet,
  contact,
  insuranceCompany,
  insurancePolicyNumber
}: EmergencyCardProps) {
  return (
    <section className="rounded-2xl border border-white/5 bg-slate-950/40 p-5 shadow-inner">
      <h2 className="text-base font-bold text-red-400">🚨 緊急情報</h2>
      <ul className="mt-3 space-y-2 text-sm text-slate-300">
        <li>
          <span className="font-semibold text-slate-400">持病:</span> {disease}
        </li>
        <li>
          <span className="font-semibold text-slate-400">服薬:</span> {medications}
        </li>
        <li>
          <span className="font-semibold text-slate-400">アレルギー:</span> {allergy}
        </li>
        <li>
          <span className="font-semibold text-slate-400">病院:</span> {vet}
        </li>
        <li>
          <span className="font-semibold text-slate-400">連絡先:</span> {contact}
        </li>
        {(insuranceCompany || insurancePolicyNumber) && (
          <li>
            <span className="font-semibold text-slate-400">保険:</span> {[insuranceCompany, insurancePolicyNumber].filter(Boolean).join(" / ")}
          </li>
        )}
      </ul>
    </section>
  );
}
