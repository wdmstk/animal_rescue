import Image from "next/image";

type PetProfileProps = {
  pet: {
    name: string;
    species: string;
    breed: string;
    sex: string;
    reproductive: string;
    sterilizedAt: string;
    age: string;
    weight: string;
    birthday: string;
    personality: string;
    features: string;
    photoUrl: string;
  };
};

export function PetProfileCard({ pet }: PetProfileProps) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-4">
        <Image
          src={pet.photoUrl}
          alt={pet.name}
          width={96}
          height={96}
          className="h-24 w-24 rounded-full object-cover"
        />
        <div>
          <h2 className="text-xl font-bold text-slate-900">{pet.name}</h2>
          <p className="text-sm text-slate-600">
            {pet.species} / {pet.breed}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-slate-50 p-2">
          <dt className="text-slate-500">性別</dt>
          <dd className="font-semibold">{pet.sex}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-2">
          <dt className="text-slate-500">年齢</dt>
          <dd className="font-semibold">{pet.age}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-2">
          <dt className="text-slate-500">体重</dt>
          <dd className="font-semibold">{pet.weight}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-2">
          <dt className="text-slate-500">誕生日</dt>
          <dd className="font-semibold">{pet.birthday}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-2">
          <dt className="text-slate-500">去勢・避妊</dt>
          <dd className="font-semibold">{pet.reproductive}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-2">
          <dt className="text-slate-500">実施日</dt>
          <dd className="font-semibold">{pet.sterilizedAt}</dd>
        </div>
      </dl>

      <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
        <p className="font-semibold text-slate-700">性格・特徴</p>
        <p className="mt-1 text-slate-600">{pet.personality}</p>
      </div>

      <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
        <p className="font-semibold text-slate-700">身体的特徴</p>
        <p className="mt-1 text-slate-600">{pet.features}</p>
      </div>
    </section>
  );
}
