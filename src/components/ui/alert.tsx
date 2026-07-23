import React from "react";

export type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  variant = "info",
  title,
  children,
  className = "",
  ...props
}) => {
  const isError = variant === "error";
  const ariaLive = isError ? "assertive" : "polite";
  const role = isError ? "alert" : "status";

  const variantStyles: Record<AlertVariant, string> = {
    info: "bg-blue-950/40 border-blue-500/30 text-blue-200",
    success: "bg-emerald-950/40 border-emerald-500/30 text-emerald-200",
    warning: "bg-amber-950/40 border-amber-500/30 text-amber-200",
    error: "bg-rose-950/40 border-rose-500/30 text-rose-200"
  };

  return (
    <div
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
      className={`p-4 rounded-xl border backdrop-blur-md transition-all ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {title && <h4 className="font-semibold mb-1 text-sm tracking-wide">{title}</h4>}
      <div className="text-xs leading-relaxed">{children}</div>
    </div>
  );
};
