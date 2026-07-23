"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { MedicalTimeline } from "@/components/features/pets/medical-timeline";
import { SubmitButton } from "@/components/ui/submit-button";
import { ToastMessage } from "@/components/ui/toast-message";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AiProposalCard } from "@/components/ui/ai-proposal-card";

type MedicalRecordType = "EXAM" | "SURGERY" | "LAB" | "MEDICATION" | "OTHER";
type DocumentType = "MEDICATION" | "VACCINATION" | "LAB" | "RECEIPT" | "OTHER";

type TimelineItem = {
  id: string;
  date: string;
  title: string;
  description: string;
  recordType: MedicalRecordType;
};

type ExtractedResult = {
  examinedOn: string | null;
  hospitalName: string | null;
  documentType: DocumentType;
  summary: string;
  candidates: Array<{ key: string; value: string }>;
  confidenceLevel?: "HIGH" | "MEDIUM" | "LOW";
  confidenceScore?: number;
  reasons?: string[];
  sources?: string[];
  disclaimer?: string;
  updatedAt?: string;
};

type MedicalRecordManagerProps = {
  petId: string;
  initialItems: TimelineItem[];
};

const today = new Date().toISOString().slice(0, 10);

const normalizeDate = (value: string) => value.slice(0, 10);

const mapDocumentTypeToRecordType = (value: DocumentType): MedicalRecordType => {
  if (value === "LAB") return "LAB";
  if (value === "MEDICATION") return "MEDICATION";
  return "OTHER";
};

export function MedicalRecordManager({ petId, initialItems }: MedicalRecordManagerProps) {
  const [items, setItems] = useState<TimelineItem[]>(initialItems);
  const [date, setDate] = useState(today);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [recordType, setRecordType] = useState<MedicalRecordType>("EXAM");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Edit / Delete states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [documentError, setDocumentError] = useState<string | null>(null);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [isExtractingDocument, setIsExtractingDocument] = useState(false);
  const [uploadedDocumentId, setUploadedDocumentId] = useState<string | null>(null);
  const [uploadedDocumentUrl, setUploadedDocumentUrl] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<ExtractedResult | null>(null);
  const documentFileInputRef = useRef<HTMLInputElement>(null);

  const sortedItems = useMemo(() => [...items].sort((a, b) => b.date.localeCompare(a.date)), [items]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    const url = editingId
      ? `/api/pets/${petId}/medical-records/${editingId}`
      : `/api/pets/${petId}/medical-records`;
    const method = editingId ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          title,
          description,
          recordType,
          photoUrl: uploadedDocumentUrl
        })
      });

      if (!response.ok) {
        throw new Error("failed");
      }

      const payload = (await response.json()) as {
        data: {
          id: string;
          date: string;
          title: string;
          description: string;
          recordType: MedicalRecordType;
        };
      };

      if (editingId) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === editingId
              ? {
                  id: editingId,
                  date: normalizeDate(payload.data.date),
                  title: payload.data.title,
                  description: payload.data.description,
                  recordType: payload.data.recordType
                }
              : item
          )
        );
        setEditingId(null);
      } else {
        setItems((prev) => [
          {
            id: payload.data.id,
            date: normalizeDate(payload.data.date),
            title: payload.data.title,
            description: payload.data.description,
            recordType: payload.data.recordType
          },
          ...prev
        ]);
      }

      // Reset form
      setDate(today);
      setTitle("");
      setDescription("");
      setUploadedDocumentId(null);
      setUploadedDocumentUrl(null);
      setExtracted(null);
      if (documentFileInputRef.current) {
        documentFileInputRef.current.value = "";
      }
    } catch {
      setError(editingId ? "記録更新に失敗しました" : "記録追加に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  const handleActualDelete = async (id: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/pets/${petId}/medical-records/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("failed");
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setDate(today);
        setTitle("");
        setDescription("");
        setRecordType("EXAM");
      }
    } catch {
      setError("削除に失敗しました");
    }
  };

  const handleDocumentUpload = async () => {
    const selectedFile = documentFileInputRef.current?.files?.[0];
    if (!selectedFile) {
      setDocumentError("画像ファイルを選択してください。");
      return;
    }

    setIsUploadingDocument(true);
    setDocumentError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadResponse = await fetch(`/api/pets/${petId}/medical-documents/upload`, {
        method: "POST",
        body: formData
      });

      if (!uploadResponse.ok) {
        const payload = (await uploadResponse.json().catch(() => null)) as { error?: unknown } | null;
        const message = typeof payload?.error === "string" ? payload.error : "画像アップロードに失敗しました。";
        throw new Error(message);
      }

      const uploadPayload = (await uploadResponse.json()) as {
        data: { publicUrl: string };
      };

      const persistResponse = await fetch(`/api/pets/${petId}/medical-documents`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          photoUrl: uploadPayload.data.publicUrl,
          capturedAt: new Date().toISOString()
        })
      });

      if (!persistResponse.ok) {
        throw new Error("書類写真の保存に失敗しました。");
      }

      const persisted = (await persistResponse.json()) as { data: { id: string; photoUrl: string } };
      setUploadedDocumentId(persisted.data.id);
      setUploadedDocumentUrl(persisted.data.photoUrl);
    } catch (unknownError) {
      setDocumentError(unknownError instanceof Error ? unknownError.message : "書類写真アップロードに失敗しました。");
    } finally {
      setIsUploadingDocument(false);
    }
  };

  const handleExtract = async () => {
    if (!uploadedDocumentId) {
      setDocumentError("先に書類写真をアップロードしてください。");
      return;
    }

    setIsExtractingDocument(true);
    setDocumentError(null);

    try {
      const response = await fetch(`/api/pets/${petId}/medical-documents/${uploadedDocumentId}/extract`, {
        method: "POST"
      });

      if (!response.ok) {
        throw new Error("OCR抽出に失敗しました。");
      }

      const payload = (await response.json()) as { extracted: ExtractedResult };
      setExtracted(payload.extracted);

      if (payload.extracted.examinedOn) {
        setDate(payload.extracted.examinedOn);
      }
      if (!title) {
        setTitle(payload.extracted.hospitalName ?? "書類写真から抽出");
      }
      if (!description) {
        const candidatesText = payload.extracted.candidates.map((item) => `${item.key}: ${item.value}`).join("\n");
        setDescription([payload.extracted.summary, candidatesText].filter(Boolean).join("\n"));
      }
      setRecordType(mapDocumentTypeToRecordType(payload.extracted.documentType));
    } catch (unknownError) {
      setDocumentError(unknownError instanceof Error ? unknownError.message : "OCR抽出に失敗しました。");
    } finally {
      setIsExtractingDocument(false);
    }
  };

  return (
    <section className="space-y-3">
      <form id="medical-record-form" onSubmit={onSubmit} className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900/60 dark:border dark:border-white/10 dark:text-slate-100 dark:backdrop-blur-md">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{editingId ? "記録を編集" : "記録を追加"}</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <Input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            aria-label="診療日"
            required
          />
          <select
            value={recordType}
            onChange={(event) => setRecordType(event.target.value as MedicalRecordType)}
            aria-label="記録種別"
            className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="EXAM">診察</option>
            <option value="SURGERY">手術</option>
            <option value="LAB">検査</option>
            <option value="MEDICATION">投薬</option>
            <option value="OTHER">その他</option>
          </select>
          <div className="md:col-span-2">
            <Input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="タイトル"
              aria-label="タイトル"
              required
            />
          </div>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="内容"
            aria-label="内容"
            className="min-h-20 w-full px-3.5 py-2 text-sm rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
            required
          />
        </div>

        {!editingId && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/5 dark:bg-slate-950/40">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">診療書類の写真登録（OCR補助）</p>
            <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center">
              <input ref={documentFileInputRef} type="file" accept="image/*" className="block w-full text-sm text-slate-700 dark:text-slate-400" />
              <button
                type="button"
                onClick={handleDocumentUpload}
                disabled={isUploadingDocument}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50 dark:bg-white/5 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
              >
                {isUploadingDocument ? "アップロード中..." : "写真を登録"}
              </button>
              <button
                type="button"
                onClick={handleExtract}
                disabled={isExtractingDocument || !uploadedDocumentId}
                className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50 dark:bg-gradient-to-r dark:from-blue-600 dark:to-indigo-500 dark:hover:opacity-95"
              >
                {isExtractingDocument ? "抽出中..." : "内容を抽出"}
              </button>
            </div>
            {uploadedDocumentUrl ? <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">書類写真を登録しました。抽出を実行できます。</p> : null}
            <div className="mt-1">
              <ToastMessage message={documentError} type="error" />
            </div>

            {extracted ? (
              <div className="mt-3">
                <AiProposalCard
                  summary={`【${extracted.documentType}】 ${extracted.summary}`}
                  reasons={extracted.reasons ?? [`病院名: ${extracted.hospitalName ?? "未記入"}`, `診察日: ${extracted.examinedOn ?? "未記入"}`]}
                  sources={extracted.sources ?? ["さけLab 医療OCR抽出エンジン v1.2"]}
                  confidenceLevel={extracted.confidenceLevel ?? "HIGH"}
                  confidenceScore={extracted.confidenceScore ?? 92}
                  updatedAt={extracted.updatedAt ?? new Date().toISOString()}
                  disclaimer={extracted.disclaimer}
                />
              </div>
            ) : null}
          </div>
        )}

        <div className="flex gap-2">
          <SubmitButton isSubmitting={isSaving} idleLabel={editingId ? "変更を保存" : "記録を保存"} className="mt-3 text-xs" />
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setDate(today);
                setTitle("");
                setDescription("");
                setRecordType("EXAM");
              }}
              className="mt-3 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:bg-white/5 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
            >
              キャンセル
            </button>
          )}
        </div>
        <div className="mt-2">
          <ToastMessage message={error} type="error" />
        </div>
      </form>

      <MedicalTimeline
        items={sortedItems}
        onEdit={(item) => {
          setEditingId(item.id);
          setDate(item.date);
          setTitle(item.title);
          setDescription(item.description);
          setRecordType(item.recordType);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onDelete={(id) => setDeletingId(id)}
      />

      <ConfirmDialog
        isOpen={deletingId !== null}
        title="医療記録の削除"
        message="この医療記録を削除してもよろしいですか？この操作は取り消せません。"
        confirmLabel="削除"
        cancelLabel="キャンセル"
        variant="danger"
        onConfirm={async () => {
          if (deletingId) {
            await handleActualDelete(deletingId);
            setDeletingId(null);
          }
        }}
        onCancel={() => setDeletingId(null)}
      />
    </section>
  );
}
