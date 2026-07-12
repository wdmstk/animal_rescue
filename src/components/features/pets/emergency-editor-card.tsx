"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { EmergencyCard } from "@/components/features/pets/emergency-card";
import { SubmitButton } from "@/components/ui/submit-button";
import { ToastMessage } from "@/components/ui/toast-message";
import { Tooltip } from "@/components/ui/tooltip";

type EmergencyInfo = {
  disease: string | null;
  currentMedications: string | null;
  allergy: string | null;
  vetName: string | null;
  vetPhone: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  bloodType: string | null;
  emergencyVetName: string | null;
  emergencyVetPhone: string | null;
  emergencyContactName2: string | null;
  emergencyContactPhone2: string | null;
};

type EmergencyEditorCardProps = {
  petId: string;
  initialEmergencyInfo: EmergencyInfo | null;
};

const getApiErrorMessage = (payload: unknown): string | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const error = (payload as { error?: unknown }).error;
  if (typeof error === "string") {
    return error;
  }

  if (!error || typeof error !== "object") {
    return null;
  }

  const formErrors = Array.isArray((error as { formErrors?: unknown }).formErrors)
    ? ((error as { formErrors?: unknown[] }).formErrors ?? []).filter((item): item is string => typeof item === "string")
    : [];
  if (formErrors.length > 0) {
    return formErrors.join(" ");
  }

  const fieldErrors = (error as { fieldErrors?: unknown }).fieldErrors;
  if (fieldErrors && typeof fieldErrors === "object") {
    for (const value of Object.values(fieldErrors)) {
      if (!Array.isArray(value)) {
        continue;
      }
      const firstMessage = value.find((item): item is string => typeof item === "string");
      if (firstMessage) {
        return firstMessage;
      }
    }
  }

  return null;
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
  const [bloodType, setBloodType] = useState(initialEmergencyInfo?.bloodType ?? "");
  const [emergencyVetName, setEmergencyVetName] = useState(initialEmergencyInfo?.emergencyVetName ?? "");
  const [emergencyVetPhone, setEmergencyVetPhone] = useState(initialEmergencyInfo?.emergencyVetPhone ?? "");
  const [emergencyContactName2, setEmergencyContactName2] = useState(initialEmergencyInfo?.emergencyContactName2 ?? "");
  const [emergencyContactPhone2, setEmergencyContactPhone2] = useState(initialEmergencyInfo?.emergencyContactPhone2 ?? "");

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
          emergencyContactPhone: toNullable(emergencyContactPhone),
          bloodType: toNullable(bloodType),
          emergencyVetName: toNullable(emergencyVetName),
          emergencyVetPhone: toNullable(emergencyVetPhone),
          emergencyContactName2: toNullable(emergencyContactName2),
          emergencyContactPhone2: toNullable(emergencyContactPhone2)
        })
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setErrorMessage(getApiErrorMessage(payload) ?? "保存に失敗しました。入力内容を確認して再度お試しください。");
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
      <p className="mt-1 text-sm text-slate-600">緊急時に必要な医療情報と連絡先を登録します。これらの情報はQRコードで共有できます。</p>
      <form className="mt-3 space-y-3" onSubmit={onSubmit}>
        <label className="block text-sm font-semibold text-slate-800">
          <div className="flex items-center gap-1">
            持病
            <Tooltip content="現在治療中または管理中の病気を記入します。緊急時の医療対応に重要です。">
              <span className="text-slate-400 hover:text-slate-600 cursor-help">?</span>
            </Tooltip>
          </div>
          <textarea
            value={disease}
            onChange={(event) => setDisease(event.target.value)}
            rows={2}
            maxLength={1000}
            placeholder="例: 僧帽弁閉鎖不全症（軽度）"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-sm font-semibold text-slate-800">
          <div className="flex items-center gap-1">
            服薬
            <Tooltip content="現在服用中の薬を記入します。薬名、用量、投与頻度を含めると医師が対応しやすくなります。">
              <span className="text-slate-400 hover:text-slate-600 cursor-help">?</span>
            </Tooltip>
          </div>
          <textarea
            value={currentMedications}
            onChange={(event) => setCurrentMedications(event.target.value)}
            rows={2}
            maxLength={1000}
            placeholder="例: ピモベンダン 1日2回"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-sm font-semibold text-slate-800">
          <div className="flex items-center gap-1">
            アレルギー
            <Tooltip content="食物、薬物、環境などのアレルギーを記入します。緊急時のアナフィラキシー対応に重要です。">
              <span className="text-slate-400 hover:text-slate-600 cursor-help">?</span>
            </Tooltip>
          </div>
          <textarea
            value={allergy}
            onChange={(event) => setAllergy(event.target.value)}
            rows={2}
            maxLength={1000}
            placeholder="例: 鶏肉アレルギー"
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
              placeholder="例: みなと動物病院"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-800">
            かかりつけ病院電話番号
            <input
              value={vetPhone}
              onChange={(event) => setVetPhone(event.target.value)}
              type="tel"
              inputMode="tel"
              pattern="[0-9+()\\-\\s]+"
              title="数字・+・()・-・スペースで入力してください"
              placeholder="例: 03-1234-5678"
              maxLength={40}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs font-normal text-slate-500">数字・+・()・-・スペースのみ入力できます。</p>
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-800">
            緊急連絡先名
            <input
              value={emergencyContactName}
              onChange={(event) => setEmergencyContactName(event.target.value)}
              maxLength={120}
              placeholder="例: 山田 花子"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-800">
            緊急連絡先電話番号
            <input
              value={emergencyContactPhone}
              onChange={(event) => setEmergencyContactPhone(event.target.value)}
              type="tel"
              inputMode="tel"
              pattern="[0-9+()\\-\\s]+"
              title="数字・+・()・-・スペースで入力してください"
              placeholder="例: 090-1234-5678"
              maxLength={40}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs font-normal text-slate-500">数字・+・()・-・スペースのみ入力できます。</p>
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-800">
            第二緊急連絡先名
            <input
              value={emergencyContactName2}
              onChange={(event) => setEmergencyContactName2(event.target.value)}
              maxLength={100}
              placeholder="例: 山田 太郎"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-800">
            第二緊急連絡先電話番号
            <input
              value={emergencyContactPhone2}
              onChange={(event) => setEmergencyContactPhone2(event.target.value)}
              type="tel"
              inputMode="tel"
              pattern="[0-9+()\\-\\s]+"
              title="数字・+・()・-・スペースで入力してください"
              placeholder="例: 080-9876-5432"
              maxLength={40}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs font-normal text-slate-500">数字・+・()・-・スペースのみ入力できます。</p>
          </label>
        </div>

        <label className="block text-sm font-semibold text-slate-800">
          <div className="flex items-center gap-1">
            血液型
            <Tooltip content="犬の血液型（DEA 1.1+等）を記入します。輸血が必要な際に重要です。">
              <span className="text-slate-400 hover:text-slate-600 cursor-help">?</span>
            </Tooltip>
          </div>
          <input
            value={bloodType}
            onChange={(event) => setBloodType(event.target.value)}
            maxLength={50}
            placeholder="例: DEA 1.1+"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-800">
            夜間救急病院名
            <input
              value={emergencyVetName}
              onChange={(event) => setEmergencyVetName(event.target.value)}
              maxLength={200}
              placeholder="例: 東京夜間動物救急センター"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-800">
            夜間救急病院電話番号
            <input
              value={emergencyVetPhone}
              onChange={(event) => setEmergencyVetPhone(event.target.value)}
              type="tel"
              inputMode="tel"
              pattern="[0-9+()\\-\\s]+"
              title="数字・+・()・-・スペースで入力してください"
              placeholder="例: 03-9876-5432"
              maxLength={40}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs font-normal text-slate-500">数字・+・()・-・スペースのみ入力できます。</p>
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
