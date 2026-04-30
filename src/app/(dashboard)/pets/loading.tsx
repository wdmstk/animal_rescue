import { SkeletonBlock } from "@/components/ui/skeleton-block";

export default function PetsLoading() {
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <SkeletonBlock className="h-4 w-36" />
        <SkeletonBlock className="mt-2 h-3 w-48" />
      </section>
      <section className="space-y-3">
        <SkeletonBlock className="h-24 w-full rounded-2xl" />
        <SkeletonBlock className="h-24 w-full rounded-2xl" />
        <SkeletonBlock className="h-24 w-full rounded-2xl" />
      </section>
    </div>
  );
}
