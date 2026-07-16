interface ProgressBarProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  color?: "sky" | "rose" | "green";
  showLabel?: boolean;
  label?: string;
}

export function ProgressBar({
  value,
  max = 100,
  size = "md",
  color = "sky",
  showLabel = true,
  label
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3"
  };
  
  const colorClasses = {
    sky: "bg-sky-500",
    rose: "bg-rose-500",
    green: "bg-green-500"
  };
  
  const bgColorClasses = {
    sky: "bg-sky-100",
    rose: "bg-rose-100",
    green: "bg-green-100"
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-700">
            {label || "進捗"}
          </span>
          <span className="text-xs font-semibold text-slate-900">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className={`w-full rounded-full ${bgColorClasses[color]} ${sizeClasses[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${colorClasses[color]} ${sizeClasses[size]}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}