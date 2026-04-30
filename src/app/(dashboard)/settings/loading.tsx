import { SkeletonBlock } from "@/components/ui/skeleton-block";

export default function SettingsLoading() {
  return (
    <div className="space-y-4">
      <SkeletonBlock className="h-44 w-full rounded-2xl" />
      <SkeletonBlock className="h-24 w-full rounded-2xl" />
      <SkeletonBlock className="h-40 w-full rounded-2xl" />
      <SkeletonBlock className="h-48 w-full rounded-2xl" />
    </div>
  );
}
