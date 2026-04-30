"use client";

type ToastMessageProps = {
  message: string | null;
  type?: "success" | "error";
};

export function ToastMessage({ message, type = "success" }: ToastMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      role="status"
      className={`rounded-lg border px-3 py-2 text-sm ${
        type === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-rose-200 bg-rose-50 text-rose-800"
      }`}
    >
      {message}
    </p>
  );
}
