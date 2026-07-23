import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  errorMessage?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, errorMessage, helperText, id, ariaDescribedby, ...props }, ref) => {
    const errorId = id ? `${id}-error` : undefined;
    const helperId = id ? `${id}-helper` : undefined;

    const describedBy = [
      error && errorId ? errorId : null,
      helperText && helperId ? helperId : null,
      ariaDescribedby
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="w-full">
        <input
          id={id}
          ref={ref}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy || undefined}
          className={`w-full px-3.5 py-2 text-sm rounded-lg bg-slate-900 border transition-all text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? "border-rose-500 focus:ring-rose-500" : "border-slate-700 hover:border-slate-600"
          } ${className}`}
          {...props}
        />
        {error && errorMessage && (
          <p id={errorId} className="mt-1 text-xs text-rose-400 font-medium">
            {errorMessage}
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className="mt-1 text-xs text-slate-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
