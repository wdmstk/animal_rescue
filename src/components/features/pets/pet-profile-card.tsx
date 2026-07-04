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
    <section className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
      <div className="mb-4 flex items-center gap-4">
        <Image
          src={pet.photoUrl}
          alt={pet.name}
          width={96}
          height={96}
          className="h-24 w-24 rounded-full object-cover"
        />
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{pet.name}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {pet.species} / {pet.breed}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-700">
          <dt className="text-slate-500 dark:text-slate-400">性別</dt>
          <dd className="font-semibold dark:text-slate-200">{pet.sex}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-700">
          <dt className="text-slate-500 dark:text-slate-400">年齢</dt>
          <dd className="font-semibold dark:text-slate-200">{pet.age}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-700">
          <dt className="text-slate-500 dark:text-slate-400">体重</dt>
          <dd className="font-semibold dark:text-slate-200">{pet.weight}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-700">
          <dt className="text-slate-500 dark:text-slate-400">誕生日</dt>
          <dd className="font-semibold dark:text-slate-200">{pet.birthday}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-700">
          <dt className="text-slate-500 dark:text-slate-400">去勢・避妊</dt>
          <dd className="font-semibold dark:text-slate-200">{pet.reproductive}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-700">
          <dt className="text-slate-500 dark:text-slate-400">実施日</dt>
          <dd className="font-semibold dark:text-slate-200">{pet.sterilizedAt}</dd>
        </div>
      </dl>

      <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-700">
        <p className="font-semibold text-slate-700 dark:text-slate-300">性格・特徴</p>
        <p className="mt-1 text-slate-600 dark:text-slate-400">{pet.personality}</p>
      </div>

      <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-700">
        <p className="font-semibold text-slate-700 dark:text-slate-300">身体的特徴</p>
        <p className="mt-1 text-slate-600 dark:text-slate-400">{pet.features}</p>
      </div>
    </section>
  );
}
