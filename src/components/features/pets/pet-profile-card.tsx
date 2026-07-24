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
    <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
      <div className="mb-4 flex items-center gap-4">
        <Image
          src={pet.photoUrl}
          alt={pet.name}
          width={96}
          height={96}
          className="h-24 w-24 rounded-full object-cover border-2 border-white/10"
        />
        <div>
          <h2 className="text-xl font-bold text-white">{pet.name}</h2>
          <p className="text-sm text-slate-300">
            {pet.species} / {pet.breed}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-2.5 text-sm">
        <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3">
          <dt className="text-xs text-slate-400">性別</dt>
          <dd className="font-semibold text-white mt-0.5">{pet.sex}</dd>
        </div>
        <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3">
          <dt className="text-xs text-slate-400">年齢</dt>
          <dd className="font-semibold text-white mt-0.5">{pet.age}</dd>
        </div>
        <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3">
          <dt className="text-xs text-slate-400">体重</dt>
          <dd className="font-semibold text-white mt-0.5">{pet.weight}</dd>
        </div>
        <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3">
          <dt className="text-xs text-slate-400">誕生日</dt>
          <dd className="font-semibold text-white mt-0.5">{pet.birthday}</dd>
        </div>
        <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3">
          <dt className="text-xs text-slate-400">去勢・避妊</dt>
          <dd className="font-semibold text-white mt-0.5">{pet.reproductive}</dd>
        </div>
        <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3">
          <dt className="text-xs text-slate-400">実施日</dt>
          <dd className="font-semibold text-white mt-0.5">{pet.sterilizedAt}</dd>
        </div>
      </dl>

      <div className="mt-3 rounded-xl border border-white/5 bg-slate-950/60 p-3 text-sm">
        <p className="font-semibold text-slate-300">性格・特徴</p>
        <p className="mt-1 text-slate-400">{pet.personality}</p>
      </div>

      <div className="mt-3 rounded-xl border border-white/5 bg-slate-950/60 p-3 text-sm">
        <p className="font-semibold text-slate-300">身体的特徴</p>
        <p className="mt-1 text-slate-400">{pet.features}</p>
      </div>
    </section>
  );
}
