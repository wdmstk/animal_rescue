import Link from "next/link";

const footerLinks = {
  サービス: [
    { href: "#features", label: "主な機能" },
    { href: "#pricing", label: "料金プラン" },
    { href: "#how-it-works", label: "利用イメージ" },
    { href: "#faq", label: "よくある質問" },
  ],
  法的情報: [
    { href: "/legal/terms", label: "利用規約" },
    { href: "/legal/privacy", label: "プライバシーポリシー" },
    { href: "/legal/tokusho", label: "特定商取引法に基づく表記" },
    { href: "/legal/cookie", label: "Cookieポリシー" },
  ],
  サポート: [
    { href: "/support", label: "お問い合わせ" },
  ],
};

export function LpFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#06060a] py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/lp" className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500">
                <span className="text-white text-base">🐾</span>
              </div>
              <span className="text-white font-semibold">
                動物の救急手帳
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              ペットの緊急医療情報を一元管理し、
              救急時に瞬時に必要情報を届ける
              命を守る情報基盤。
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © 2026 動物の救急手帳. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            本サービスは医療情報の記録・共有ツールであり、診断・治療を提供するものではありません。
          </p>
        </div>
      </div>
    </footer>
  );
}
