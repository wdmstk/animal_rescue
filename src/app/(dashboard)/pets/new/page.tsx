"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import { ToastMessage } from "@/components/ui/toast-message";
import { Tooltip } from "@/components/ui/tooltip";

type Species = "dog" | "cat" | "other";
type Sex = "MALE" | "FEMALE" | "UNKNOWN";
type ReproductiveStatus = "INTACT" | "NEUTERED" | "SPAYED" | "UNKNOWN";

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
const reproductiveOptions: Array<{ value: ReproductiveStatus; label: string }> = [
  { value: "UNKNOWN", label: "不明" },
  { value: "INTACT", label: "未実施" },
  { value: "NEUTERED", label: "去勢済み" },
  { value: "SPAYED", label: "避妊済み" }
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
  const [reproductiveStatus, setReproductiveStatus] = useState<ReproductiveStatus>("UNKNOWN");
  const [sterilizedAt, setSterilizedAt] = useState("");

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
          birthday: toNullable(birthday),
          reproductiveStatus,
          sterilizedAt: reproductiveStatus === "NEUTERED" || reproductiveStatus === "SPAYED" ? toNullable(sterilizedAt) : null
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
            placeholder="例: モカ"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-800">
            <div className="flex items-center gap-1">
              種類
              <Tooltip content="ペットの種類を選択します。犬、猫、またはその他の動物を指定できます。">
                <span className="text-slate-400 hover:text-slate-600 cursor-help">?</span>
              </Tooltip>
            </div>
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
              placeholder="例: トイプードル"
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
            <div className="flex items-center gap-1">
              去勢・避妊
              <Tooltip content="去勢はオスの生殖能力を除去する手術、避妊はメスの生殖能力を除去する手術です。健康上のメリットがあります。">
                <span className="text-slate-400 hover:text-slate-600 cursor-help">?</span>
              </Tooltip>
            </div>
            <select
              name="reproductiveStatus"
              value={reproductiveStatus}
              onChange={(event) => setReproductiveStatus(event.target.value as ReproductiveStatus)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {reproductiveOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            実施日
            <input
              name="sterilizedAt"
              type="date"
              value={sterilizedAt}
              disabled={reproductiveStatus !== "NEUTERED" && reproductiveStatus !== "SPAYED"}
              onChange={(event) => setSterilizedAt(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
            />
          </label>
        </div>

        <ToastMessage message={errorMessage} type="error" />

        <SubmitButton isSubmitting={isSubmitting} idleLabel="登録する" className="w-full" />
      </form>
    </section>
  );
}
