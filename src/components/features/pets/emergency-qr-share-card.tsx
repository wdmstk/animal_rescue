import Link from "next/link";

type EmergencyQrShareCardProps = {
  token: string;
};

export function EmergencyQrShareCard({ token }: EmergencyQrShareCardProps) {
  return (
    <section className="rounded-2xl border border-emergency-100 bg-white p-4 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">QR共有</h2>
      <p className="mt-2 text-sm text-slate-600">緊急時に必要最小限の情報を公開するURLです。</p>
      <div className="mt-3 rounded-lg bg-slate-100 p-2 text-xs text-slate-700 break-all">/e/{token}</div>
      <Link
        href={`/e/${token}`}
        className="mt-3 inline-block rounded-lg bg-emergency-500 px-3 py-2 text-xs font-semibold text-white"
      >
        公開画面を確認
      </Link>
    </section>
  );
}
