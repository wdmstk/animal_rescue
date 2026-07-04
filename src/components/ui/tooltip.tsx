"use client";

import { useState } from "react";

type TooltipProps = {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
};

export function Tooltip({ content, children, position = "top" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2"
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-slate-800 border-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-slate-800 border-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-slate-800 border-transparent border-r-transparent",
    right: "right-full top-1/2 -translate-y-1/2 border-r-slate-800 border-transparent border-l-transparent"
  };

  return (
    <div className="relative inline-block">
      <div
        className="inline-flex cursor-help"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        tabIndex={0}
        role="button"
        aria-label="詳細情報を表示"
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          className={`absolute z-50 w-64 rounded-lg bg-slate-800 px-3 py-2 text-xs text-white shadow-lg ${positionClasses[position]}`}
          role="tooltip"
        >
          <div
            className={`absolute h-0 w-0 border-4 ${arrowClasses[position]}`}
          />
          {content}
        </div>
      )}
    </div>
  );
}