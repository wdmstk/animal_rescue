"use client";

import { useState } from "react";

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  variant?: "default" | "compact";
}

export function Tabs({ tabs, defaultTab, variant = "default" }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  const getButtonClasses = (tabId: string) => {
    const baseClasses = variant === "compact" 
      ? "px-3 py-1.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap"
      : "px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap";
    
    const activeClasses = activeTab === tabId
      ? "border-emerald-500 text-emerald-700"
      : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300";
    
    return `${baseClasses} ${activeClasses}`;
  };

  return (
    <div className="w-full">
      <div className="border-b border-slate-200" role="tablist" aria-label="Tabs">
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={getButtonClasses(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab.id}`}
            className={activeTab === tab.id ? "block" : "hidden"}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}