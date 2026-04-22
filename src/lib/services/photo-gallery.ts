export type PetPhotoItem = {
  id: string;
  photoUrl: string;
  sortOrder: number;
  createdAt: string;
};

export const sortPetPhotos = (photos: PetPhotoItem[]): PetPhotoItem[] =>
  [...photos].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }

    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
