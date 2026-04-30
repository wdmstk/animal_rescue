import { SkeletonBlock } from "@/components/ui/skeleton-block";

export default function PetDetailLoading() {
  return (
    <div className="space-y-4">
      <SkeletonBlock className="h-36 w-full rounded-2xl" />
      <SkeletonBlock className="h-64 w-full rounded-2xl" />
      <SkeletonBlock className="h-56 w-full rounded-2xl" />
    </div>
  );
}
