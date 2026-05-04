"use client";

import Image from "next/image";
import { FormEvent, useRef, useState } from "react";

type PetPhotoGalleryProps = {
  petId: string;
  photos: string[];
};

type UploadUrlResponse = {
  data: {
    publicUrl: string;
    signedUrl: string;
  };
};

export function PetPhotoGallery({ petId, photos }: PetPhotoGalleryProps) {
  const [items, setItems] = useState(photos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const selectedFile = fileInputRef.current?.files?.[0];

    if (!selectedFile) {
      setError("画像ファイルを選択してください。");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadUrlResponse = await fetch(`/api/pets/${petId}/photos/upload-url`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fileName: selectedFile.name,
          contentType: selectedFile.type
        })
      });

      if (!uploadUrlResponse.ok) {
        throw new Error("アップロードURLの作成に失敗しました。");
      }

      const uploadUrlPayload = (await uploadUrlResponse.json()) as UploadUrlResponse;
      const uploaded = await fetch(uploadUrlPayload.data.signedUrl, {
        method: "PUT",
        headers: {
          "content-type": selectedFile.type
        },
        body: selectedFile
      });

      if (!uploaded.ok) {
        throw new Error("画像アップロードに失敗しました。");
      }

      const persisted = await fetch(`/api/pets/${petId}/photos`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          photoUrl: uploadUrlPayload.data.publicUrl,
          sortOrder: items.length
        })
      });

      if (!persisted.ok) {
        const payload = (await persisted.json().catch(() => null)) as { error?: unknown } | null;
        const detail =
          typeof payload?.error === "string"
            ? payload.error
            : payload?.error && typeof payload.error === "object"
              ? JSON.stringify(payload.error)
              : null;
        throw new Error(detail ? `写真の保存に失敗しました。(${detail})` : "写真の保存に失敗しました。");
      }

      setItems((prev) => [...prev, uploadUrlPayload.data.publicUrl]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : "写真アップロードに失敗しました。";
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">サブ写真</h2>
      <form className="mt-3 space-y-2" onSubmit={handleSubmit}>
        <input id="pet-photo-file-input" ref={fileInputRef} type="file" accept="image/*" className="block w-full text-sm text-slate-700" />
        <button
          type="submit"
          disabled={uploading}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {uploading ? "アップロード中..." : "写真を追加"}
        </button>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </form>
      {items.length > 0 ? (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {items.map((url, index) => (
            <Image
              key={`${url}-${index}`}
              src={url}
              alt={`サブ写真${index + 1}`}
              width={120}
              height={120}
              className="h-24 w-full rounded-lg object-cover"
            />
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm text-slate-600">写真がまだありません。</p>
          <p className="mt-1 text-xs text-slate-500">ファイルを選択して「写真を追加」を押すと登録できます。</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.focus()}
            className="mt-2 inline-flex rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700"
          >
            画像を選択する
          </button>
        </div>
      )}
    </section>
  );
}
