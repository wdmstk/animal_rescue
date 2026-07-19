"use client";

import Image from "next/image";

export function LpOverview() {
  return (
    <section id="overview" className="py-24 lg:py-32 bg-[#06060a]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Image */}
          <div className="relative order-2 lg:order-1">
            <div
              aria-hidden="true"
              className="absolute inset-0 scale-110 bg-gradient-to-br from-blue-500/20 to-violet-500/20 blur-3xl rounded-3xl"
            />
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <Image
                src="/lp-dashboard.jpg"
                alt="動物の救急手帳 - ペット健康管理ダッシュボードのモックアップ"
                width={500}
                height={667}
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Text */}
          <div className="order-1 lg:order-2 space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
                サービス概要
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                「動物の救急手帳」は、
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                  命を守る情報基盤
                </span>
                です。
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed">
                ペットの医療情報・緊急連絡先・投薬記録・ワクチン履歴を、
                スマートフォンひとつで一元管理。
                いざというとき、QRコードを見せるだけで、
                獣医師に必要なすべてが伝わります。
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  step: "01",
                  title: "情報を登録する",
                  desc: "ペットの基本情報・持病・アレルギー・投薬・ワクチン履歴を登録します。最初の設定は5分程度。",
                },
                {
                  step: "02",
                  title: "家族と共有する",
                  desc: "招待コードで家族を追加。全員がリアルタイムで最新情報にアクセスできます。",
                },
                {
                  step: "03",
                  title: "緊急時はQRを見せる",
                  desc: "3タップでQRコードを表示。病院スタッフがスキャンするだけで、すべての情報が瞬時に届きます。",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-5">
                  <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/30">
                    <span className="text-xs font-bold text-blue-400">{item.step}</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-semibold text-white">{item.title}</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
