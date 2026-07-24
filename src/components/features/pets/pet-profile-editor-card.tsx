"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PetProfileCard } from "@/components/features/pets/pet-profile-card";
import { SubmitButton } from "@/components/ui/submit-button";
import { ToastMessage } from "@/components/ui/toast-message";
import { Tooltip } from "@/components/ui/tooltip";
import { FormField } from "@/components/ui/form-field";

type Species = "dog" | "cat" | "other";
type Sex = "MALE" | "FEMALE" | "UNKNOWN";
type ReproductiveStatus = "INTACT" | "NEUTERED" | "SPAYED" | "UNKNOWN";

type PetProfileEditorCardProps = {
  petId: string;
  initialPet: {
    name: string;
    species: Species;
    breed: string | null;
    sex: Sex;
    reproductiveStatus: ReproductiveStatus;
    sterilizedAt: string | null;
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
const reproductiveLabelMap: Record<ReproductiveStatus, string> = {
  INTACT: "未実施",
  NEUTERED: "去勢済み",
  SPAYED: "避妊済み",
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [name, setName] = useState(initialPet.name);
  const [species, setSpecies] = useState<Species>(initialPet.species);
  const [sex, setSex] = useState<Sex>(initialPet.sex);
  const [breed, setBreed] = useState(initialPet.breed ?? "");
  const [birthday, setBirthday] = useState(initialPet.birthday ? normalizeDate(initialPet.birthday) : "");
  const [reproductiveStatus, setReproductiveStatus] = useState<ReproductiveStatus>(initialPet.reproductiveStatus);
  const [sterilizedAt, setSterilizedAt] = useState(initialPet.sterilizedAt ? normalizeDate(initialPet.sterilizedAt) : "");
  const [ageYears, setAgeYears] = useState(initialPet.ageYears !== null ? String(initialPet.ageYears) : "");
  const [weightKg, setWeightKg] = useState(initialPet.weightKg !== null ? String(initialPet.weightKg) : "");
  const [notesPersonality, setNotesPersonality] = useState(initialPet.notesPersonality ?? "");
  const [notesFeatures, setNotesFeatures] = useState(initialPet.notesFeatures ?? "");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string) => {
    let error = "";
    
    switch (field) {
      case "name":
        if (!value.trim()) error = "名前を入力してください";
        else if (value.length > 64) error = "名前は64文字以内で入力してください";
        break;
      case "breed":
        if (value.length > 64) error = "品種は64文字以内で入力してください";
        break;
      case "ageYears":
        if (value && (Number(value) < 0 || Number(value) > 99)) error = "年齢は0〜99歳で入力してください";
        break;
      case "weightKg":
        if (value && (Number(value) < 0.1 || Number(value) > 200)) error = "体重は0.1〜200kgで入力してください";
        break;
      case "sterilizedAt":
        if (reproductiveStatus === "NEUTERED" || reproductiveStatus === "SPAYED") {
          if (!value) error = "実施日を入力してください";
        }
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
    return error;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = "名前を入力してください";
    if (name.length > 64) newErrors.name = "名前は64文字以内で入力してください";
    if (breed.length > 64) newErrors.breed = "品種は64文字以内で入力してください";
    if (ageYears && (Number(ageYears) < 0 || Number(ageYears) > 99)) newErrors.ageYears = "年齢は0〜99歳で入力してください";
    if (weightKg && (Number(weightKg) < 0.1 || Number(weightKg) > 200)) newErrors.weightKg = "体重は0.1〜200kgで入力してください";
    if ((reproductiveStatus === "NEUTERED" || reproductiveStatus === "SPAYED") && !sterilizedAt) {
      newErrors.sterilizedAt = "実施日を入力してください";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const firstPhoto = initialPet.photos[0]?.photoUrl;
  const profile = {
    name,
    species: speciesLabelMap[species],
    breed: toNullable(breed) ?? "未登録",
    sex: sexLabelMap[sex],
    reproductive: reproductiveLabelMap[reproductiveStatus],
    sterilizedAt:
      (reproductiveStatus === "NEUTERED" || reproductiveStatus === "SPAYED") && toNullable(sterilizedAt)
        ? sterilizedAt
        : "未登録",
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
    setSuccessMessage(null);
    
    if (!validateForm()) {
      return;
    }
    
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
          reproductiveStatus,
          sterilizedAt:
            reproductiveStatus === "NEUTERED" || reproductiveStatus === "SPAYED" ? toNullable(sterilizedAt) : null,
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

      setSuccessMessage("基本情報を保存しました");
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
          className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition"
        >
          基本情報を編集
        </button>
      </div>
    );
  }

  const inputBaseClass = "w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none disabled:bg-slate-900 disabled:text-slate-500";

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
      <h2 className="text-lg font-bold text-white">基本情報を編集</h2>
      <p className="mt-1 text-sm text-slate-300">ペットの基本情報を登録します。すべての項目は後で変更できます。</p>

      <form className="mt-4 space-y-4" onSubmit={onSubmit}>
        <FormField
          label="名前"
          required
          error={errors.name}
          description="ペットの名前を入力してください"
        >
          <input
            name="name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              validateField("name", event.target.value);
            }}
            required
            maxLength={64}
            placeholder="例: ポコ"
            className={`${inputBaseClass} ${errors.name ? "border-rose-500/50 bg-rose-950/30" : ""}`}
          />
        </FormField>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="種類"
            tooltip="ペットの種類を選択します。犬、猫、またはその他の動物を指定できます。"
          >
            <select
              name="species"
              value={species}
              onChange={(event) => setSpecies(event.target.value as Species)}
              className={inputBaseClass}
            >
              <option value="dog">犬</option>
              <option value="cat">猫</option>
              <option value="other">その他</option>
            </select>
          </FormField>

          <FormField
            label="性別"
          >
            <select
              name="sex"
              value={sex}
              onChange={(event) => setSex(event.target.value as Sex)}
              className={inputBaseClass}
            >
              <option value="MALE">オス</option>
              <option value="FEMALE">メス</option>
              <option value="UNKNOWN">不明</option>
            </select>
          </FormField>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="品種"
            error={errors.breed}
            description="例: トイプードル、柴犬など"
          >
            <input
              name="breed"
              value={breed}
              onChange={(event) => {
                setBreed(event.target.value);
                validateField("breed", event.target.value);
              }}
              maxLength={64}
              placeholder="例: トイプードル"
              className={`${inputBaseClass} ${errors.breed ? "border-rose-500/50 bg-rose-950/30" : ""}`}
            />
          </FormField>

          <FormField
            label="誕生日"
            description="誕生日がわかる場合のみ入力"
          >
            <input
              name="birthday"
              type="date"
              value={birthday}
              onChange={(event) => setBirthday(event.target.value)}
              className={inputBaseClass}
            />
          </FormField>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="去勢・避妊"
            tooltip="去勢はオスの生殖能力を除去する手術、避妊はメスの生殖能力を除去する手術です。健康上のメリットがあります。"
          >
            <select
              name="reproductiveStatus"
              value={reproductiveStatus}
              onChange={(event) => setReproductiveStatus(event.target.value as ReproductiveStatus)}
              className={inputBaseClass}
            >
              <option value="UNKNOWN">不明</option>
              <option value="INTACT">未実施</option>
              <option value="NEUTERED">去勢済み</option>
              <option value="SPAYED">避妊済み</option>
            </select>
          </FormField>

          <FormField
            label="実施日"
            error={errors.sterilizedAt}
            description="去勢・避妊の場合は実施日を入力"
          >
            <input
              name="sterilizedAt"
              type="date"
              value={sterilizedAt}
              disabled={reproductiveStatus !== "NEUTERED" && reproductiveStatus !== "SPAYED"}
              onChange={(event) => {
                setSterilizedAt(event.target.value);
                validateField("sterilizedAt", event.target.value);
              }}
              className={`${inputBaseClass} ${errors.sterilizedAt ? "border-rose-500/50 bg-rose-950/30" : ""}`}
            />
          </FormField>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="年齢"
            error={errors.ageYears}
            description="0〜99歳の範囲で入力"
          >
            <input
              name="ageYears"
              type="number"
              min={0}
              max={99}
              value={ageYears}
              onChange={(event) => {
                setAgeYears(event.target.value);
                validateField("ageYears", event.target.value);
              }}
              placeholder="例: 3"
              className={`${inputBaseClass} ${errors.ageYears ? "border-rose-500/50 bg-rose-950/30" : ""}`}
            />
          </FormField>

          <FormField
            label="体重(kg)"
            error={errors.weightKg}
            description="0.1〜200kgの範囲で入力"
          >
            <input
              name="weightKg"
              type="number"
              min={0.1}
              max={200}
              step={0.1}
              value={weightKg}
              onChange={(event) => {
                setWeightKg(event.target.value);
                validateField("weightKg", event.target.value);
              }}
              placeholder="例: 5.2"
              className={`${inputBaseClass} ${errors.weightKg ? "border-rose-500/50 bg-rose-950/30" : ""}`}
            />
          </FormField>
        </div>

        <label className="block text-sm font-semibold text-slate-200">
          <div className="flex items-center gap-1">
            性格・特徴
            <Tooltip content="ペットの性格や行動上の特徴を記入します。例：人懐っこい、雷が苦手、など">
              <span className="text-slate-400 hover:text-slate-300 cursor-help">?</span>
            </Tooltip>
          </div>
          <textarea
            name="notesPersonality"
            value={notesPersonality}
            onChange={(event) => setNotesPersonality(event.target.value)}
            maxLength={500}
            rows={3}
            className={`mt-1 ${inputBaseClass}`}
          />
        </label>

        <label className="block text-sm font-semibold text-slate-200">
          <div className="flex items-center gap-1">
            身体的特徴
            <Tooltip content="ペットの身体的な特徴を記入します。例：左耳の先に白い毛あり、模様、など">
              <span className="text-slate-400 hover:text-slate-300 cursor-help">?</span>
            </Tooltip>
          </div>
          <textarea
            name="notesFeatures"
            value={notesFeatures}
            onChange={(event) => setNotesFeatures(event.target.value)}
            maxLength={500}
            rows={3}
            className={`mt-1 ${inputBaseClass}`}
          />
        </label>

        <ToastMessage message={errorMessage} type="error" />
        <ToastMessage message={successMessage} type="success" />

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            キャンセル
          </button>
          <SubmitButton isSubmitting={isSubmitting} idleLabel="保存する" />
        </div>
      </form>
    </section>
  );
}
