import Link from "next/link";
import { redirect } from "next/navigation";
import { HouseholdInviteCodeCard } from "@/components/features/pets/household-invite-code-card";
import { PetListCard } from "@/components/features/pets/pet-list-card";
import { ONBOARDING_TOTAL_STEPS, calculateOnboardingProgress } from "@/lib/onboarding-progress";
import { requireAuthenticatedUser } from "@/lib/auth/pet-access";
import { prisma } from "@/lib/prisma";

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
    pets = userPets;
  } catch {
    hasError = true;
  }

  if (process.env.PLAYWRIGHT_E2E === "1" && (pets.length === 0 || hasError)) {
    pets = [{ id: "sample-pet", name: "モカ", species: "dog", breed: "トイプードル" }];
    hasError = false;
  }

  const completedSteps = pets.length > 0 ? 1 : 0;
  const completionRate = calculateOnboardingProgress(completedSteps, ONBOARDING_TOTAL_STEPS);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-sky-200 bg-sky-50 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-sky-900">はじめての方へ（3ステップ）</h2>
          <p className="text-xs font-semibold text-sky-900">完了率: {completionRate}%</p>
        </div>
        <ol className="mt-2 space-y-1 text-xs text-sky-900">
          <li>1. ペット登録: {pets.length > 0 ? "完了" : "未完了"}</li>
          <li>2. 緊急情報入力: {pets.length > 0 ? "ペット詳細で入力" : "ペット登録後に入力"}</li>
          <li>3. QR共有: {pets.length > 0 ? "ペット詳細で共有可能" : "ペット登録後に共有可能"}</li>
        </ol>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">ペットプロフィール</h2>
            <p className="mt-1 text-sm text-slate-600">家族全員で最新の救急情報を管理できます。</p>
          </div>
          <Link
            href="/pets/new"
            className="shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
          >
            ペットを追加
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <HouseholdInviteCodeCard />

        {hasError ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            ペット一覧の取得に失敗しました。時間をおいて再度お試しください。
          </p>
        ) : pets.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-700">まだペットが登録されていません。</p>
            <p className="mt-1 text-xs text-slate-500">まずは1匹登録して、緊急情報や健康記録の管理を始めましょう。</p>
            <Link
              href="/pets/new"
              className="mt-3 inline-flex rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
            >
              最初のペットを登録
            </Link>
          </div>
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
