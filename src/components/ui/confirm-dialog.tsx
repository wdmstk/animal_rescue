"use client";

import { React } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "確認",
  cancelLabel = "キャンセル",
  variant = "default",
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
  };

  const variantStyles = variant === "danger" 
    ? "bg-rose-600 hover:bg-rose-700 text-white"
    : "bg-slate-900 hover:bg-slate-800 text-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-700 whitespace-pre-line">{message}</p>
        
        <div className="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${variantStyles}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}