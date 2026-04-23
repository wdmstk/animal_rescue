import Image from "next/image";

type PetPhotoGalleryProps = {
  photos: string[];
};

export function PetPhotoGallery({ photos }: PetPhotoGalleryProps) {
  if (photos.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">サブ写真</h2>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {photos.map((url, index) => (
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
    </section>
  );
}
