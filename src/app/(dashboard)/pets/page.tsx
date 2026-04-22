import Link from "next/link";

const mockPets = [
  { id: "sample-pet", name: "モカ", species: "犬", breed: "トイプードル" }
];

export default function PetsPage() {
  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold">ペットプロフィール</h2>
        <p className="mt-1 text-sm text-slate-600">家族全員で最新の救急情報を管理できます。</p>
      </section>

      <section className="space-y-3">
        {mockPets.map((pet) => (
          <Link
            key={pet.id}
            href={`/pets/${pet.id}`}
            className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <h3 className="text-base font-bold text-slate-900">{pet.name}</h3>
            <p className="text-sm text-slate-600">
              {pet.species} / {pet.breed}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
