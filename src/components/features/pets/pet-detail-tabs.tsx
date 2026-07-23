"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { PetProfileCard } from "./pet-profile-card";
import { PetProfileEditorCard } from "./pet-profile-editor-card";
import { PetPhotoGallery } from "./pet-photo-gallery";
import { EmergencyEditorCard } from "./emergency-editor-card";
import { EmergencyQrShareCard } from "./emergency-qr-share-card";
import { MedicationManagerCard } from "./medication-manager-card";
import { VaccinationManager } from "./vaccination-manager";
import { HealthTrackingPanel } from "./health-tracking-panel";
import { MedicalRecordManager } from "./medical-record-manager";
import { ChangeHistoryList } from "./change-history-list";
import { PetExportCard } from "./pet-export-card";
import { PetDeleteCard } from "./pet-delete-card";
import { PrintCareSummaryCard } from "./print-care-summary-card";

const normalizeDate = (value: string) => value.slice(0, 10);

type TabGroup = {
  id: string;
  label: string;
  tabs: Array<{ id: string; label: string }>;
};

const tabGroups: TabGroup[] = [
  {
    id: "basic",
    label: "基本情報",
    tabs: [
      { id: "profile", label: "👤 プロフィール" },
      { id: "photos", label: "🖼️ サブ写真" }
    ]
  },
  {
    id: "emergency",
    label: "緊急",
    tabs: [
      { id: "emergency", label: "🚨 緊急情報編集" },
      { id: "qr", label: "📱 QR共有" }
    ]
  },
  {
    id: "medical",
    label: "医療",
    tabs: [
      { id: "medications", label: "💊 投薬管理" },
      { id: "vaccinations", label: "💉 ワクチン・予防歴" },
      { id: "health", label: "📊 健康記録・グラフ" },
      { id: "records", label: "📋 医療記録・書類" },
      { id: "export", label: "🖨️ 提出サマリー・出力" }
    ]
  },
  {
    id: "management",
    label: "管理",
    tabs: [
      { id: "history", label: "📜 更新履歴" },
      { id: "delete", label: "🗑️ 削除" }
    ]
  }
];

export function PetDetailTabs({
  petId,
  pet,
  activeToken,
  changeHistoryItems,
  isE2E = false
}: {
  petId: string;
  pet: any;
  activeToken: string | null;
  changeHistoryItems: any;
  isE2E?: boolean;
}) {
  const [activeSubTabs, setActiveSubTabs] = useState<Record<string, string>>({
    basic: "profile",
    emergency: "emergency",
    medical: "medications",
    management: "history"
  });

  const setSubTab = (groupId: string, subTabId: string) => {
    setActiveSubTabs((prev) => ({ ...prev, [groupId]: subTabId }));
  };

  const renderTabContent = (tabId: string) => {
    if (isE2E) {
      switch (tabId) {
        case "profile":
          return <PetProfileCard pet={pet} />;
        case "photos":
          return <PetPhotoGallery petId={petId} photos={pet.photos || []} />;
        case "emergency":
          return <EmergencyEditorCard petId={petId} initialEmergencyInfo={pet.emergencyInfo} />;
        case "qr":
          return <EmergencyQrShareCard petId={petId} initialToken={activeToken ?? undefined} />;
        case "medications":
          return <MedicationManagerCard petId={petId} initialItems={pet.medications || []} />;
        case "vaccinations":
          return <VaccinationManager petId={petId} initialItems={pet.vaccinations || []} />;
        case "health":
          return <HealthTrackingPanel petId={petId} />;
        case "records":
          return <MedicalRecordManager petId={petId} initialItems={pet.medicalRecords || []} />;
        case "history":
          return <ChangeHistoryList items={changeHistoryItems} />;
        case "export":
          return (
            <div className="space-y-4">
              <PrintCareSummaryCard
                pet={pet}
                emergencyInfo={pet.emergencyInfo}
                medications={pet.medications || []}
                vaccinations={pet.vaccinations || []}
                medicalRecords={pet.medicalRecords || []}
              />
              <PetExportCard petId={petId} />
            </div>
          );
        case "delete":
          return <PetDeleteCard petId={petId} petName={pet.name} />;
        default:
          return null;
      }
    }

    switch (tabId) {
      case "profile":
        return <PetProfileEditorCard petId={petId} initialPet={pet} />;
      case "photos":
        return <PetPhotoGallery petId={petId} photos={pet.photos ? pet.photos.map((photo: any) => photo.photoUrl) : []} />;
      case "emergency":
        return <EmergencyEditorCard petId={petId} initialEmergencyInfo={pet.emergencyInfo} />;
      case "qr":
        return <EmergencyQrShareCard petId={petId} initialToken={activeToken ?? undefined} />;
      case "medications":
        return (
          <MedicationManagerCard
            petId={petId}
            initialItems={pet.medications ? pet.medications.map((item: any) => ({
              id: item.id,
              name: item.name,
              dosage: item.dosage,
              frequency: item.frequency,
              startDate: typeof item.startDate === "string" ? item.startDate : normalizeDate(item.startDate.toISOString()),
              endDate: item.endDate ? (typeof item.endDate === "string" ? item.endDate : normalizeDate(item.endDate.toISOString())) : null
            })) : []}
          />
        );
      case "vaccinations":
        return (
          <VaccinationManager
            petId={petId}
            initialItems={pet.vaccinations ? pet.vaccinations.map((item: any) => ({
              id: item.id,
              typeCode: item.type,
              customTypeName: item.customTypeName,
              date: typeof item.date === "string" ? item.date : normalizeDate(item.date.toISOString()),
              nextDue: item.nextDue ? (typeof item.nextDue === "string" ? item.nextDue : normalizeDate(item.nextDue.toISOString())) : null,
              type:
                item.type === "RABIES"
                  ? "狂犬病"
                  : item.type === "CORE"
                    ? "混合ワクチン"
                    : item.type === "HEARTWORM"
                      ? "フィラリア"
                      : item.type === "FLEA_TICK"
                        ? "ノミ・ダニ"
                        : item.customTypeName ?? "その他"
            })) : []}
          />
        );
      case "health":
        return <HealthTrackingPanel petId={petId} />;
      case "records":
        return (
          <MedicalRecordManager
            petId={petId}
            initialItems={pet.medicalRecords ? pet.medicalRecords.map((item: any) => ({
              id: item.id,
              date: typeof item.date === "string" ? item.date : normalizeDate(item.date.toISOString()),
              title: item.title,
              description: item.description,
              recordType: item.recordType
            })) : []}
          />
        );
      case "history":
        return <ChangeHistoryList items={changeHistoryItems} />;
      case "export":
        return (
          <div className="space-y-4">
            <PrintCareSummaryCard
              pet={{
                name: pet.name,
                species: pet.species,
                breed: pet.breed,
                sex: pet.sex,
                birthday: pet.birthday ? (typeof pet.birthday === "string" ? pet.birthday : normalizeDate(pet.birthday.toISOString())) : null,
                ageYears: pet.ageYears,
                weightKg: pet.weightKg !== null ? Number(pet.weightKg) : null
              }}
              emergencyInfo={pet.emergencyInfo}
              medications={pet.medications ? pet.medications.map((item: any) => ({
                name: item.name,
                dosage: item.dosage,
                frequency: item.frequency
              })) : []}
              vaccinations={pet.vaccinations ? pet.vaccinations.map((item: any) => ({
                type: item.type,
                date: typeof item.date === "string" ? item.date : normalizeDate(item.date.toISOString()),
                nextDue: item.nextDue ? (typeof item.nextDue === "string" ? item.nextDue : normalizeDate(item.nextDue.toISOString())) : null
              })) : []}
              medicalRecords={pet.medicalRecords ? pet.medicalRecords.map((item: any) => ({
                date: typeof item.date === "string" ? item.date : normalizeDate(item.date.toISOString()),
                title: item.title,
                description: item.description
              })) : []}
            />
            <PetExportCard petId={petId} />
          </div>
        );
      case "delete":
        return <PetDeleteCard petId={petId} petName={pet.name} />;
      default:
        return null;
    }
  };

  return (
    <Tabs
      tabs={tabGroups.map((group) => ({
        id: group.id,
        label: group.label,
        content: (
          <div key={group.id} className="space-y-4">
            {/* 医療タブのみサブタブ選択ボタンを表示 */}
            {group.id === "medical" && (
              <div className="flex flex-wrap gap-2 border-b border-slate-700/50 pb-3">
                {group.tabs.map((tab) => {
                  const isSelected = activeSubTabs[group.id] === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSubTab(group.id, tab.id)}
                      className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20 scale-[1.02]"
                          : "bg-slate-950/40 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 医療タブは選択中サブタブのみ表示、それ以外のタブは全項目を縦並びで表示 */}
            {group.id === "medical"
              ? group.tabs.map((tab) => {
                  const isSelected = activeSubTabs[group.id] === tab.id;
                  return (
                    <div key={tab.id} id={tab.id} className={isSelected ? "block" : "hidden"}>
                      {renderTabContent(tab.id)}
                    </div>
                  );
                })
              : group.tabs.map((tab) => (
                  <div key={tab.id} className="scroll-mt-4">
                    {renderTabContent(tab.id)}
                  </div>
                ))}
          </div>
        )
      }))}
      defaultTab="basic"
    />
  );
}
