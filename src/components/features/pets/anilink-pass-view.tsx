"use client";

import React from "react";
import type { AniLinkPassData } from "@/lib/services/anilink-pass-query";
import { MedicalDisclaimer } from "@/components/common/medical-disclaimer";

type AniLinkPassViewProps = {
  data: AniLinkPassData;
};

export const AniLinkPassView: React.FC<AniLinkPassViewProps> = ({ data }) => {
  const { sbar } = data;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-slate-100">
      {/* Header Banner */}
      <header className="rounded-2xl border border-teal-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-teal-950/40 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {data.mainPhotoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={data.mainPhotoUrl}
              alt={data.petName}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-teal-400/40 shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-4xl">
              🐾
            </div>
          )}

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                AniLink 診察用パス
              </span>
              <span className="text-xs text-slate-400">要約提示UI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{data.petName}</h1>
            <p className="text-sm text-slate-300">
              {sbar.background.species} {sbar.background.breed ? `/ ${sbar.background.breed}` : ""}
              {sbar.background.weightKg ? ` / ${sbar.background.weightKg} kg` : ""}
            </p>
          </div>
        </div>
      </header>

      {/* SBAR Section Grid */}
      <main className="grid gap-5 md:grid-cols-2">
        {/* S: Situation */}
        <section className="rounded-2xl border border-rose-500/30 bg-slate-900/80 p-5 shadow-lg backdrop-blur-md space-y-3">
          <div className="flex items-center gap-2 border-b border-rose-500/20 pb-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/20 text-xs font-bold text-rose-300">S</span>
            <h2 className="text-lg font-bold text-rose-200">Situation（主訴・現状問診）</h2>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-xs font-medium text-slate-400">直近の診療・主訴</p>
              <p className="font-semibold text-rose-100">{sbar.situation.primaryComplaint ?? "特になし"}</p>
            </div>
            {sbar.situation.recentMedicalSummary && (
              <div>
                <p className="text-xs font-medium text-slate-400">直近記録サマリー</p>
                <p className="mt-0.5 text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  {sbar.situation.recentMedicalSummary}
                </p>
              </div>
            )}
            {sbar.situation.specialNotes && (
              <div>
                <p className="text-xs font-medium text-amber-400">⚠️ 飼い主からの特記事項</p>
                <p className="mt-0.5 text-xs text-amber-200 bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/30">
                  {sbar.situation.specialNotes}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* B: Background */}
        <section className="rounded-2xl border border-blue-500/30 bg-slate-900/80 p-5 shadow-lg backdrop-blur-md space-y-3">
          <div className="flex items-center gap-2 border-b border-blue-500/20 pb-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-300">B</span>
            <h2 className="text-lg font-bold text-blue-200">Background（背景・既往歴）</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-slate-400">持病・既往症</p>
              <p className="font-semibold text-white">{sbar.background.disease ?? "なし"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">アレルギー</p>
              <p className="font-semibold text-rose-300">{sbar.background.allergy ?? "なし"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-slate-400">現在服用中の薬</p>
              {sbar.background.currentMedications.length > 0 ? (
                <ul className="mt-1 space-y-1">
                  {sbar.background.currentMedications.map((m, idx) => (
                    <li key={idx} className="text-xs bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800 flex justify-between">
                      <span className="font-semibold text-teal-300">{m.name}</span>
                      <span className="text-slate-400">{m.dosage} ({m.frequency})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400">登録なし</p>
              )}
            </div>
            {sbar.background.vetName && (
              <div>
                <p className="text-xs text-slate-400">かかりつけ病院</p>
                <p className="text-xs font-medium text-slate-200">{sbar.background.vetName} ({sbar.background.vetPhone ?? "-"})</p>
              </div>
            )}
            {sbar.background.emergencyContactName && (
              <div>
                <p className="text-xs text-slate-400">緊急連絡先</p>
                <p className="text-xs font-medium text-slate-200">{sbar.background.emergencyContactName} ({sbar.background.emergencyContactPhone ?? "-"})</p>
              </div>
            )}
          </div>
        </section>

        {/* A: Assessment */}
        <section className="rounded-2xl border border-teal-500/30 bg-slate-900/80 p-5 shadow-lg backdrop-blur-md space-y-3 col-span-full">
          <div className="flex items-center justify-between border-b border-teal-500/20 pb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/20 text-xs font-bold text-teal-300">A</span>
              <h2 className="text-lg font-bold text-teal-200">Assessment（最新の血液検査・検査数値）</h2>
            </div>
            {sbar.assessment.latestLabDate && (
              <span className="text-xs text-slate-400">検査日: {sbar.assessment.latestLabDate}</span>
            )}
          </div>

          {sbar.assessment.labMarkers.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {sbar.assessment.labMarkers.map((lab, idx) => (
                <div key={idx} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <span className="text-xs font-medium text-slate-400">{lab.marker}</span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-xl font-bold text-teal-300">{lab.value}</span>
                    <span className="text-xs text-slate-400">{lab.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-3 text-center">登録済みの最新血液検査データはありません</p>
          )}
        </section>

        {/* R: Recommendation */}
        <section className="rounded-2xl border border-purple-500/30 bg-slate-900/80 p-5 shadow-lg backdrop-blur-md space-y-3 col-span-full">
          <div className="flex items-center gap-2 border-b border-purple-500/20 pb-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-xs font-bold text-purple-300">R</span>
            <h2 className="text-lg font-bold text-purple-200">Recommendation（予防接種歴・投薬履歴）</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold text-purple-300 mb-2">💉 ワクチン・予防接種歴</h3>
              {sbar.recommendation.vaccinations.length > 0 ? (
                <ul className="space-y-1.5">
                  {sbar.recommendation.vaccinations.map((vac, idx) => (
                    <li key={idx} className="text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
                      <span className="font-semibold text-slate-200">{vac.type}</span>
                      <div className="text-right text-[11px] text-slate-400">
                        <span>接種: {vac.date}</span>
                        {vac.nextDue && <span className="block text-teal-400">次回予定: {vac.nextDue}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400">接種歴はありません</p>
              )}
            </div>

            <div>
              <h3 className="text-xs font-semibold text-purple-300 mb-2">💊 投薬履歴</h3>
              {sbar.recommendation.recentMedications.length > 0 ? (
                <ul className="space-y-1.5">
                  {sbar.recommendation.recentMedications.map((med, idx) => (
                    <li key={idx} className="text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
                      <span className="font-semibold text-slate-200">{med.name}</span>
                      <span className="text-[11px] text-slate-400">
                        {med.startDate} 〜 {med.endDate ?? "継続中"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400">投薬歴はありません</p>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer Disclaimer */}
      <footer className="pt-2">
        <MedicalDisclaimer variant="card" />
      </footer>
    </div>
  );
};
