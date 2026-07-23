"use client";

type ToastMessageProps = {
  message: string | null;
  type?: "success" | "error";
};

export function ToastMessage({ message, type = "success" }: ToastMessageProps) {
  if (!message) {
    return null;
  }

  const isError = type === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      aria-atomic="true"
      className={`rounded-lg border px-3.5 py-2.5 text-sm backdrop-blur-md transition-all ${
        type === "success"
          ? "border-emerald-500/30 bg-emerald-950/60 text-emerald-200"
          : "border-rose-500/30 bg-rose-950/60 text-rose-200"
      }`}
    >
      {message}
    </div>
  );
}
