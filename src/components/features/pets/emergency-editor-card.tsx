"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { EmergencyCard } from "@/components/features/pets/emergency-card";
import { SubmitButton } from "@/components/ui/submit-button";
import { ToastMessage } from "@/components/ui/toast-message";

type EmergencyInfo = {
  disease: string | null;
  currentMedications: string | null;
  allergy: string | null;
  vetName: string | null;
  vetPhone: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
};

type EmergencyEditorCardProps = {
  petId: string;
  initialEmergencyInfo: EmergencyInfo | null;
};

const toNullable = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export function EmergencyEditorCard({ petId, initialEmergencyInfo }: EmergencyEditorCardProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [disease, setDisease] = useState(initialEmergencyInfo?.disease ?? "");
  const [currentMedications, setCurrentMedications] = useState(initialEmergencyInfo?.currentMedications ?? "");
  const [allergy, setAllergy] = useState(initialEmergencyInfo?.allergy ?? "");
  const [vetName, setVetName] = useState(initialEmergencyInfo?.vetName ?? "");
  const [vetPhone, setVetPhone] = useState(initialEmergencyInfo?.vetPhone ?? "");
  const [emergencyContactName, setEmergencyContactName] = useState(initialEmergencyInfo?.emergencyContactName ?? "");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(initialEmergencyInfo?.emergencyContactPhone ?? "");

  const vetDisplay =
    toNullable(vetName) && toNullable(vetPhone)
      ? `${vetName} ${vetPhone}`
      : toNullable(vetName) ?? toNullable(vetPhone) ?? "未登録";
  const contactDisplay =
    toNullable(emergencyContactName) && toNullable(emergencyContactPhone)
      ? `${emergencyContactName} ${emergencyContactPhone}`
      : toNullable(emergencyContactName) ?? toNullable(emergencyContactPhone) ?? "未登録";

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/pets/${petId}/emergency-info`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          disease: toNullable(disease),
          currentMedications: toNullable(currentMedications),
          allergy: toNullable(allergy),
          vetName: toNullable(vetName),
          vetPhone: toNullable(vetPhone),
          emergencyContactName: toNullable(emergencyContactName),
          emergencyContactPhone: toNullable(emergencyContactPhone)
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
        <EmergencyCard
          disease={toNullable(disease) ?? "未登録"}
          medications={toNullable(currentMedications) ?? "未登録"}
          allergy={toNullable(allergy) ?? "未登録"}
          vet={vetDisplay}
          contact={contactDisplay}
        />
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="w-full rounded-lg border border-emergency-200 bg-white px-4 py-2 text-sm font-semibold text-emergency-700"
        >
          緊急情報を編集
        </button>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-emergency-100 bg-emergency-50 p-4">
      <h2 className="text-base font-bold text-emergency-700">緊急情報を編集</h2>
      <form className="mt-3 space-y-3" onSubmit={onSubmit}>
        <label className="block text-sm font-semibold text-slate-800">
          持病
          <textarea
            value={disease}
            onChange={(event) => setDisease(event.target.value)}
            rows={2}
            maxLength={1000}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-sm font-semibold text-slate-800">
          服薬
          <textarea
            value={currentMedications}
            onChange={(event) => setCurrentMedications(event.target.value)}
            rows={2}
            maxLength={1000}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-sm font-semibold text-slate-800">
          アレルギー
          <textarea
            value={allergy}
            onChange={(event) => setAllergy(event.target.value)}
            rows={2}
            maxLength={1000}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-800">
            かかりつけ病院名
            <input
              value={vetName}
              onChange={(event) => setVetName(event.target.value)}
              maxLength={120}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-800">
            かかりつけ病院電話番号
            <input
              value={vetPhone}
              onChange={(event) => setVetPhone(event.target.value)}
              maxLength={40}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-800">
            緊急連絡先名
            <input
              value={emergencyContactName}
              onChange={(event) => setEmergencyContactName(event.target.value)}
              maxLength={120}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-800">
            緊急連絡先電話番号
            <input
              value={emergencyContactPhone}
              onChange={(event) => setEmergencyContactPhone(event.target.value)}
              maxLength={40}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <ToastMessage message={errorMessage} type="error" />

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800"
          >
            キャンセル
          </button>
          <SubmitButton isSubmitting={isSubmitting} idleLabel="保存する" className="bg-emergency-600" />
        </div>
      </form>
    </section>
  );
}
