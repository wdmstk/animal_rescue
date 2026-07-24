import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  tooltip?: string;
  children: ReactNode;
  description?: string;
}

export function FormField({ label, error, required, tooltip, children, description }: FormFieldProps) {
  return (
    <label className="block">
      <div className="flex items-center gap-1">
        <span className="text-sm font-semibold text-slate-200">
          {label}
          {required && <span className="text-rose-400"> *</span>}
        </span>
        {tooltip && (
          <span className="text-xs text-slate-400 cursor-help" title={tooltip}>
            ?
          </span>
        )}
      </div>
      {description && (
        <p className="mt-1 text-xs text-slate-400">{description}</p>
      )}
      <div className="mt-1">{children}</div>
      {error && (
        <p className="mt-1 text-xs text-rose-400 font-medium">{error}</p>
      )}
    </label>
  );
}