import type { Metadata } from "next";
import { LpHeader } from "@/components/lp/LpHeader";
import { LpHero } from "@/components/lp/LpHero";
import { LpProblem } from "@/components/lp/LpProblem";
import { LpOverview } from "@/components/lp/LpOverview";
import { LpFeatures } from "@/components/lp/LpFeatures";
import { LpDifference } from "@/components/lp/LpDifference";
import { LpHowItWorks } from "@/components/lp/LpHowItWorks";
import { LpPricing } from "@/components/lp/LpPricing";
import { LpSecurity } from "@/components/lp/LpSecurity";
import { LpFaq } from "@/components/lp/LpFaq";
import { LpCta } from "@/components/lp/LpCta";
import { LpFooter } from "@/components/lp/LpFooter";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const metadata: Metadata = {
  title: "AniLink | ペットの緊急医療情報をQRコードで瞬時に共有",
  description:
    "ペットの持病・アレルギー・投薬・ワクチン・病院情報を一元管理。緊急時にQRコード一枚で獣医師に情報共有。30日間無料・家族全員で使えるペット医療管理SaaS AniLink。",
  keywords: [
    "ペット 緊急 QRコード",
    "ペット 健康管理 アプリ",
    "ペット 医療記録",
    "犬 猫 健康管理",
    "ペット 家族共有",
    "動物病院 情報共有",
    "ペット 緊急医療",
    "ペット 投薬管理",
    "ペット ワクチン管理",
    "AniLink",
    "動物の救急手帳",
  ],
  authors: [{ name: "AniLink" }],
  openGraph: {
    type: "website",
    url: `${siteUrl}/lp`,
    title: "AniLink | QRコード一枚で、大切な命を守る情報基盤",
    description:
      "ペットの緊急医療情報をQRコードで一瞬共有。家族全員で医療記録・投薬・ワクチンを一元管理。30日間無料・月額680円（税別）。",
    siteName: "AniLink",
    locale: "ja_JP",
    images: [
      {
        url: `${siteUrl}/lp-hero-qr.jpg`,
        width: 1200,
        height: 630,
        alt: "AniLink - ペット緊急QRコード管理サービス",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AniLink | QRコード一枚で、大切な命を守る情報基盤",
    description:
      "ペットの緊急医療情報をQRコードで一瞬共有。30日間無料。",
    images: [`${siteUrl}/lp-hero-qr.jpg`],
  },
  alternates: {
    canonical: `${siteUrl}/lp`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function LandingPage() {
  return (
    <>
      {/* Structured Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "動物の救急手帳",
            applicationCategory: "HealthApplication",
            description:
              "ペットの緊急医療情報をQRコードで管理・共有するSaaSアプリケーション。持病・アレルギー・投薬・ワクチン・家族共有機能を提供。",
            url: `${siteUrl}/lp`,
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "680",
              priceCurrency: "JPY",
              priceValidUntil: "2027-12-31",
              description: "月額680円（税別）。30日間無料トライアルあり。",
            },
            audience: {
              "@type": "Audience",
              audienceType: "Pet owners",
            },
            featureList: [
              "QRコードによる緊急医療情報共有",
              "家族全員での情報共有",
              "投薬管理とリマインダー",
              "ワクチン履歴管理",
              "健康データグラフ表示",
              "医療記録タイムライン",
              "PDF出力",
              "医療書類OCR読取",
            ],
          }),
        }}
      />

      <div className="min-h-screen bg-[#0a0a0f]">
        <LpHeader />
        <main>
          <LpHero />
          <LpProblem />
          <LpOverview />
          <LpFeatures />
          <LpDifference />
          <LpHowItWorks />
          <LpPricing />
          <LpSecurity />
          <LpFaq />
          <LpCta />
        </main>
        <LpFooter />
      </div>
    </>
  );
}
