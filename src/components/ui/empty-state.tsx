interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ReactNode;
  illustration?: "pets" | "records" | "health" | "general";
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon,
  illustration = "general"
}: EmptyStateProps) {
  const illustrations = {
    pets: (
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-sky-100">
        <span className="text-4xl">🐾</span>
      </div>
    ),
    records: (
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-sky-100">
        <span className="text-4xl">📋</span>
      </div>
    ),
    health: (
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-sky-100">
        <span className="text-4xl">❤️</span>
      </div>
    ),
    general: (
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
        <span className="text-4xl">📝</span>
      </div>
    )
  };

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center">
      {icon || illustrations[illustration]}
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      {actionLabel && actionHref && (
        <a
          href={actionHref}
          className="mt-4 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          {actionLabel}
        </a>
      )}
    </div>
  );
}