"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PetProfileCard } from "@/components/features/pets/pet-profile-card";
import { SubmitButton } from "@/components/ui/submit-button";
import { ToastMessage } from "@/components/ui/toast-message";

type Species = "dog" | "cat" | "other";
type Sex = "MALE" | "FEMALE" | "UNKNOWN";

type PetProfileEditorCardProps = {
  petId: string;
  initialPet: {
    name: string;
    species: Species;
    breed: string | null;
    sex: Sex;
    ageYears: number | null;
    weightKg: number | null;
    birthday: string | null;
    notesPersonality: string | null;
    notesFeatures: string | null;
    mainPhotoUrl: string | null;
    photos: Array<{ photoUrl: string }>;
  };
};

const speciesLabelMap: Record<Species, string> = {
  dog: "犬",
  cat: "猫",
  other: "その他"
};

const sexLabelMap: Record<Sex, string> = {
  MALE: "オス",
  FEMALE: "メス",
  UNKNOWN: "不明"
};

const normalizeDate = (value: string) => value.slice(0, 10);

const toNullable = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export function PetProfileEditorCard({ petId, initialPet }: PetProfileEditorCardProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [name, setName] = useState(initialPet.name);
  const [species, setSpecies] = useState<Species>(initialPet.species);
  const [sex, setSex] = useState<Sex>(initialPet.sex);
  const [breed, setBreed] = useState(initialPet.breed ?? "");
  const [birthday, setBirthday] = useState(initialPet.birthday ? normalizeDate(initialPet.birthday) : "");
  const [ageYears, setAgeYears] = useState(initialPet.ageYears !== null ? String(initialPet.ageYears) : "");
  const [weightKg, setWeightKg] = useState(initialPet.weightKg !== null ? String(initialPet.weightKg) : "");
  const [notesPersonality, setNotesPersonality] = useState(initialPet.notesPersonality ?? "");
  const [notesFeatures, setNotesFeatures] = useState(initialPet.notesFeatures ?? "");

  const firstPhoto = initialPet.photos[0]?.photoUrl;
  const profile = {
    name,
    species: speciesLabelMap[species],
    breed: toNullable(breed) ?? "未登録",
    sex: sexLabelMap[sex],
    age: toNullable(ageYears) ? `${ageYears}歳` : "未登録",
    weight: toNullable(weightKg) ? `${weightKg}kg` : "未登録",
    birthday: toNullable(birthday) ?? "未登録",
    personality: toNullable(notesPersonality) ?? "未登録",
    features: toNullable(notesFeatures) ?? "未登録",
    photoUrl: initialPet.mainPhotoUrl ?? firstPhoto ?? "https://images.unsplash.com/photo-1517849845537-4d257902454a"
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/pets/${petId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          species,
          sex,
          breed: toNullable(breed),
          birthday: toNullable(birthday),
          ageYears: toNullable(ageYears) ? Number(ageYears) : null,
          weightKg: toNullable(weightKg) ? Number(weightKg) : null,
          notesPersonality: toNullable(notesPersonality),
          notesFeatures: toNullable(notesFeatures)
        })
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setErrorMessage("保存に失敗しました。入力内容を確認して再度お試しください。");
        return;
      }

      setIsEditing(false);
      router.refresh();
    } catch {
      setErrorMessage("通信エラーが発生しました。時間をおいて再度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="space-y-3">
        <PetProfileCard pet={profile} />
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800"
        >
          基本情報を編集
        </button>
      </div>
    );
  }

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">基本情報を編集</h2>

      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <label className="block text-sm font-semibold text-slate-800">
          名前
          <input
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            maxLength={64}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-800">
            種類
            <select
              name="species"
              value={species}
              onChange={(event) => setSpecies(event.target.value as Species)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="dog">犬</option>
              <option value="cat">猫</option>
              <option value="other">その他</option>
            </select>
          </label>

          <label className="block text-sm font-semibold text-slate-800">
            性別
            <select
              name="sex"
              value={sex}
              onChange={(event) => setSex(event.target.value as Sex)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="MALE">オス</option>
              <option value="FEMALE">メス</option>
              <option value="UNKNOWN">不明</option>
            </select>
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-800">
            品種
            <input
              name="breed"
              value={breed}
              onChange={(event) => setBreed(event.target.value)}
              maxLength={64}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-800">
            誕生日
            <input
              name="birthday"
              type="date"
              value={birthday}
              onChange={(event) => setBirthday(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-800">
            年齢
            <input
              name="ageYears"
              type="number"
              min={0}
              max={99}
              value={ageYears}
              onChange={(event) => setAgeYears(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-800">
            体重(kg)
            <input
              name="weightKg"
              type="number"
              min={0.1}
              max={200}
              step={0.1}
              value={weightKg}
              onChange={(event) => setWeightKg(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <label className="block text-sm font-semibold text-slate-800">
          性格・特徴
          <textarea
            name="notesPersonality"
            value={notesPersonality}
            onChange={(event) => setNotesPersonality(event.target.value)}
            maxLength={500}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-sm font-semibold text-slate-800">
          身体的特徴
          <textarea
            name="notesFeatures"
            value={notesFeatures}
            onChange={(event) => setNotesFeatures(event.target.value)}
            maxLength={500}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <ToastMessage message={errorMessage} type="error" />

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800"
          >
            キャンセル
          </button>
          <SubmitButton isSubmitting={isSubmitting} idleLabel="保存する" />
        </div>
      </form>
    </section>
  );
}
