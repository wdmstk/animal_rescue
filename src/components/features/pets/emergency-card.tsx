type EmergencyCardProps = {
  disease: string;
  medications: string;
  allergy: string;
  vet: string;
  contact: string;
};

export function EmergencyCard({ disease, medications, allergy, vet, contact }: EmergencyCardProps) {
  return (
    <section className="rounded-2xl border border-emergency-100 bg-emergency-50 p-4 dark:border-emergency-900 dark:bg-emergency-950">
      <h2 className="text-base font-bold text-emergency-700 dark:text-emergency-400">緊急情報</h2>
      <ul className="mt-3 space-y-2 text-sm dark:text-slate-300">
        <li>
          <span className="font-semibold">持病:</span> {disease}
        </li>
        <li>
          <span className="font-semibold">服薬:</span> {medications}
        </li>
        <li>
          <span className="font-semibold">アレルギー:</span> {allergy}
        </li>
        <li>
          <span className="font-semibold">病院:</span> {vet}
        </li>
        <li>
          <span className="font-semibold">連絡先:</span> {contact}
        </li>
      </ul>
    </section>
  );
}
