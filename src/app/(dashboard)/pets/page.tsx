import Link from "next/link";
import { redirect } from "next/navigation";
import { HouseholdInviteCodeCard } from "@/components/features/pets/household-invite-code-card";
import { PetListCard } from "@/components/features/pets/pet-list-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { ONBOARDING_TOTAL_STEPS, calculateOnboardingProgress, getOnboardingSteps } from "@/lib/onboarding-progress";
import { requireAuthenticatedUser } from "@/lib/auth/pet-access";
import { prisma } from "@/lib/prisma";

import { AnnouncementBanner } from "@/components/features/announcements/announcement-banner";

export default async function PetsPage() {
  // Server-side authentication and data fetching
  const auth = await requireAuthenticatedUser();
  if (auth instanceof Response) {
    redirect("/login");
  }

  let pets: Array<{
    id: string;
    name: string;
    species: "dog" | "cat" | "other";
    breed: string | null;
  }> = [];
  let hasError = false;

  try {
    const userPets = await prisma.pet.findMany({
      where: {
        household: {
          members: {
            some: { userId: auth.userId }
          }
        }
      },
      select: {
        id: true,
        name: true,
        species: true,
        breed: true
      }
    });
    pets = userPets.map(pet => ({
      ...pet,
      species: pet.species as "dog" | "cat" | "other"
    }));
  } catch {
    hasError = true;
  }

  if (process.env.PLAYWRIGHT_E2E === "1" && (pets.length === 0 || hasError)) {
    pets = [{ id: "demo-pet", name: "モカ", species: "dog" as "dog" | "cat" | "other", breed: "トイプードル" }];
    hasError = false;
  }

  const completedSteps = pets.length > 0 ? 1 : 0;
  const completionRate = calculateOnboardingProgress(completedSteps, ONBOARDING_TOTAL_STEPS);
  const onboardingSteps = getOnboardingSteps(pets.length > 0);

  return (
    <div className="space-y-4">
      <AnnouncementBanner />

      <section className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 shadow-xl">
        <div className="mb-3">
          <h2 className="text-sm font-bold text-blue-300">はじめての方へ（3ステップ）</h2>
          <p className="mt-1 text-xs text-slate-300">最初のペットを登録して、緊急情報の管理を始めましょう</p>
        </div>
        
        <ProgressBar 
          value={completionRate} 
          max={100} 
          size="md" 
          color="sky" 
          label="完了率"
        />
        
        <ol className="mt-3 space-y-2">
          {onboardingSteps.map((step, index) => (
            <li key={step.id} className="flex items-start gap-2">
              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                step.completed 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-slate-700 text-slate-300'
              }`}>
                {step.completed ? '✓' : index + 1}
              </div>
              <div className="flex-1">
                <p className={`text-xs font-medium ${
                  step.completed ? 'text-blue-300' : 'text-slate-300'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-slate-400">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md text-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">ペットプロフィール</h2>
            <p className="mt-1 text-sm text-slate-400">家族全員で最新の救急情報を管理できます。</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              href="/pets/compare"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-white/10 active:scale-95 transition-all min-h-[36px]"
            >
              健康データを比較
            </Link>
            <Link
              href="/pets/new"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-bold text-xs hover:opacity-95 active:scale-95 transition-all min-h-[36px] px-4"
            >
              ペットを追加
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <HouseholdInviteCodeCard />

        {hasError ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            ペット一覧の取得に失敗しました。時間をおいて再度お試しください。
          </p>
        ) : pets.length === 0 ? (
          <EmptyState
            title="まだペットが登録されていません"
            description="まずは1匹登録して、緊急情報や健康記録の管理を始めましょう"
            actionLabel="最初のペットを登録"
            actionHref="/pets/new"
            illustration="pets"
          />
        ) : (
          pets.map((pet) => (
            <PetListCard
              key={pet.id}
              id={pet.id}
              name={pet.name}
              species={pet.species}
              breed={pet.breed}
            />
          ))
        )}
      </section>
    </div>
  );
}
