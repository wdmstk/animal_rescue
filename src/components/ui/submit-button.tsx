type SubmitButtonProps = {
  isSubmitting: boolean;
  idleLabel: string;
  submittingLabel?: string;
  className?: string;
  disabled?: boolean;
};

export function SubmitButton({
  isSubmitting,
  idleLabel,
  submittingLabel = "保存中...",
  className = "",
  disabled = false
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || isSubmitting}
      className={`rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {isSubmitting ? submittingLabel : idleLabel}
    </button>
  );
}
