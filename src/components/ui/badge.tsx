import React from "react";

export type BadgeVariant = "default" | "brand" | "success" | "warning" | "error" | "info" | "outline";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  children,
  className = "",
  ...props
}) => {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";
  
  const variantStyles: Record<BadgeVariant, string> = {
    default: "bg-slate-800 text-slate-200 border border-slate-700",
    brand: "bg-blue-600/20 text-blue-300 border border-blue-500/30",
    success: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    error: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
    info: "bg-sky-500/20 text-sky-300 border border-sky-500/30",
    outline: "bg-transparent text-slate-300 border border-slate-600"
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
