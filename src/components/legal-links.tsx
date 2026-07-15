"use client";

import Link from "next/link";

export function LegalLinks() {
  return (
    <p className="text-center text-xs text-slate-500 dark:text-slate-500">
      <Link href="/legal/terms" className="hover:underline">利用規約</Link>
      {"・"}
      <Link href="/legal/privacy" className="hover:underline">プライバシーポリシー</Link>
      {"・"}
      <Link href="/legal/commercial" className="hover:underline">特定商取引法表記</Link>
      {"・"}
      <Link href="/legal/cookie" className="hover:underline">Cookieポリシー</Link>
    </p>
  );
}