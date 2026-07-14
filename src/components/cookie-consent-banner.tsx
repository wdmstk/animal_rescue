"use client";

import { useState, useEffect } from "react";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem("cookie-consent");
    if (!hasConsented) {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => setIsVisible(true), 0);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "true");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "false");
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 shadow-lg z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          当社はサービスの利便性向上のためにCookieを使用します。
          詳細は
          <a href="/legal/cookie" className="text-slate-900 dark:text-slate-100 underline ml-1">
            Cookieポリシー
          </a>
          をご確認ください。
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
          >
            拒否
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200"
          >
            同意する
          </button>
        </div>
      </div>
    </div>
  );
}