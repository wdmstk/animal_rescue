import { SkeletonBlock } from "@/components/ui/skeleton-block";

export default function InviteJoinLoading() {
  return (
    <div className="mx-auto mt-8 w-full max-w-md rounded-2xl bg-white p-4 shadow-sm">
      <SkeletonBlock className="h-5 w-28" />
      <SkeletonBlock className="mt-3 h-4 w-56" />
      <SkeletonBlock className="mt-4 h-10 w-full" />
      <SkeletonBlock className="mt-3 h-10 w-full" />
    </div>
  );
}
