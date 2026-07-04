"use client";

import { useTheme } from "@/components/providers/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const themes: { value: "light" | "dark" | "system"; label: string; icon: string }[] = [
    { value: "light", label: "ライト", icon: "☀️" },
    { value: "dark", label: "ダーク", icon: "🌙" },
    { value: "system", label: "自動", icon: "🔄" },
  ];

  return (
    <div className="flex items-center gap-1">
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => setTheme(t.value)}
          className={`rounded-md px-2 py-1 text-xs font-semibold transition-colors ${
            theme === t.value
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
          }`}
          aria-label={t.label}
          title={t.label}
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
}
