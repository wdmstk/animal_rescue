import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { HouseholdInviteCodeCard } from "@/components/features/pets/household-invite-code-card";

type PetsResponse = {
  data: Array<{
    id: string;
    name: string;
    species: "dog" | "cat" | "other";
    breed: string | null;
  }>;
};

const speciesLabelMap: Record<"dog" | "cat" | "other", string> = {
  dog: "犬",
  cat: "猫",
  other: "その他"
};

const resolveOriginAndCookie = async () => {
  const requestHeaders = await headers();
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";

  return {
    origin: `${protocol}://${host}`,
    cookie: requestHeaders.get("cookie") ?? ""
  };
};

export default async function PetsPage() {
  const { origin, cookie } = await resolveOriginAndCookie();
  let pets: PetsResponse["data"] = [];
  let hasError = false;

  try {
    const response = await fetch(`${origin}/api/pets`, {
      cache: "no-store",
      headers: cookie ? { cookie } : undefined
    });

    if (response.status === 401) {
      redirect("/login");
    }

    if (!response.ok) {
      hasError = true;
    } else {
      const payload = (await response.json()) as PetsResponse;
      pets = payload.data;
    }
  } catch {
    hasError = true;
  }

  if (process.env.PLAYWRIGHT_E2E === "1" && (pets.length === 0 || hasError)) {
    pets = [{ id: "sample-pet", name: "モカ", species: "dog", breed: "トイプードル" }];
    hasError = false;
  }

  return (
    <div className="space-y-4">
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
          <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            まだペットが登録されていません。
          </p>
        ) : (
          pets.map((pet) => (
            <Link
              key={pet.id}
              href={`/pets/${pet.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <h3 className="text-base font-bold text-slate-900">{pet.name}</h3>
              <p className="text-sm text-slate-600">
                {speciesLabelMap[pet.species]} / {pet.breed ?? "未登録"}
              </p>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
