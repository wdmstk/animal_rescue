"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Species = "dog" | "cat" | "other";
type Sex = "MALE" | "FEMALE" | "UNKNOWN";

const speciesOptions: Array<{ value: Species; label: string }> = [
  { value: "dog", label: "犬" },
  { value: "cat", label: "猫" },
  { value: "other", label: "その他" }
];

const sexOptions: Array<{ value: Sex; label: string }> = [
  { value: "MALE", label: "オス" },
  { value: "FEMALE", label: "メス" },
  { value: "UNKNOWN", label: "不明" }
];

const toNullable = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export default function NewPetPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [species, setSpecies] = useState<Species>("dog");
  const [sex, setSex] = useState<Sex>("UNKNOWN");
  const [breed, setBreed] = useState("");
  const [birthday, setBirthday] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/pets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          species,
          sex,
          breed: toNullable(breed),
          birthday: toNullable(birthday)
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

      const payload = (await response.json()) as { data: { id: string } };
      router.push(`/pets/${payload.data.id}`);
      router.refresh();
    } catch {
      setErrorMessage("通信エラーが発生しました。時間をおいて再度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">ペットを追加</h2>
          <p className="mt-1 text-sm text-slate-600">基本情報を登録すると、救急情報の管理を始められます。</p>
        </div>
        <Link href="/pets" className="text-xs font-semibold text-slate-700 underline">
          一覧に戻る
        </Link>
      </div>

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
              {speciesOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
              {sexOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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

        {errorMessage ? <p className="text-sm text-rose-700">{errorMessage}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "保存中..." : "登録する"}
        </button>
      </form>
    </section>
  );
}
