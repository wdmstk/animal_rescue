import { prisma } from "@/lib/prisma";

export type AniLinkPassSbar = {
  situation: {
    primaryComplaint: string | null;
    recentMedicalSummary: string | null;
    specialNotes: string | null;
  };
  background: {
    petName: string;
    species: string;
    breed: string | null;
    sex: string;
    reproductiveStatus: string;
    weightKg: number | null;
    disease: string | null;
    allergy: string | null;
    currentMedications: Array<{ name: string; dosage: string; frequency: string }>;
    vetName: string | null;
    vetPhone: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
  };
  assessment: {
    latestLabDate: string | null;
    labMarkers: Array<{ marker: string; value: number; unit: string; category: string }>;
  };
  recommendation: {
    vaccinations: Array<{ type: string; date: string; nextDue: string | null }>;
    recentMedications: Array<{ name: string; startDate: string; endDate: string | null }>;
  };
};

export type AniLinkPassData = {
  token: string;
  petName: string;
  mainPhotoUrl: string | null;
  sbar: AniLinkPassSbar;
  updatedAt: string;
};

const formatDate = (date: Date | null): string | null => (date ? date.toISOString().slice(0, 10) : null);

export async function getAniLinkPassByToken(token: string): Promise<AniLinkPassData | null> {
  const tokenRow = await prisma.petEmergencyToken.findFirst({
    where: {
      token,
      isActive: true
    },
    select: {
      pet: {
        select: {
          id: true,
          name: true,
          species: true,
          breed: true,
          sex: true,
          reproductiveStatus: true,
          weightKg: true,
          mainPhotoUrl: true,
          photos: {
            take: 1,
            orderBy: { sortOrder: "asc" },
            select: { photoUrl: true }
          },
          emergencyInfo: {
            select: {
              disease: true,
              allergy: true,
              currentMedications: true,
              vetName: true,
              vetPhone: true,
              emergencyContactName: true,
              emergencyContactPhone: true,
              specialNotes: true
            }
          },
          medicalRecords: {
            orderBy: { date: "desc" },
            take: 3,
            select: {
              date: true,
              title: true,
              description: true,
              recordType: true
            }
          },
          medications: {
            orderBy: { startDate: "desc" },
            take: 5,
            select: {
              name: true,
              dosage: true,
              frequency: true,
              startDate: true,
              endDate: true
            }
          },
          vaccinations: {
            orderBy: { date: "desc" },
            take: 5,
            select: {
              type: true,
              customTypeName: true,
              date: true,
              nextDue: true
            }
          },
          labResults: {
            orderBy: { recordedAt: "desc" },
            take: 10,
            select: {
              marker: true,
              value: true,
              unit: true,
              category: true,
              recordedAt: true
            }
          }
        }
      }
    }
  });

  if (!tokenRow?.pet) {
    return null;
  }

  const pet = tokenRow.pet;
  const recentRecord = pet.medicalRecords[0];

  const currentMedicationsList = pet.medications.map((m) => ({
    name: m.name,
    dosage: m.dosage,
    frequency: m.frequency
  }));

  const latestLabDate = pet.labResults[0] ? formatDate(pet.labResults[0].recordedAt) : null;
  const labMarkers = pet.labResults.map((l) => ({
    marker: l.marker,
    value: Number(l.value),
    unit: l.unit,
    category: l.category
  }));

  const vaccinationsList = pet.vaccinations.map((v) => ({
    type: v.customTypeName ? `${v.type} (${v.customTypeName})` : v.type,
    date: formatDate(v.date)!,
    nextDue: formatDate(v.nextDue)
  }));

  const recentMedicationsList = pet.medications.map((m) => ({
    name: m.name,
    startDate: formatDate(m.startDate)!,
    endDate: formatDate(m.endDate)
  }));

  return {
    token,
    petName: pet.name,
    mainPhotoUrl: pet.mainPhotoUrl ?? pet.photos[0]?.photoUrl ?? null,
    sbar: {
      situation: {
        primaryComplaint: recentRecord ? `${recentRecord.title} (${recentRecord.recordType})` : null,
        recentMedicalSummary: recentRecord ? recentRecord.description : null,
        specialNotes: pet.emergencyInfo?.specialNotes ?? null
      },
      background: {
        petName: pet.name,
        species: pet.species,
        breed: pet.breed,
        sex: pet.sex,
        reproductiveStatus: pet.reproductiveStatus,
        weightKg: pet.weightKg ? Number(pet.weightKg) : null,
        disease: pet.emergencyInfo?.disease ?? null,
        allergy: pet.emergencyInfo?.allergy ?? null,
        currentMedications: currentMedicationsList,
        vetName: pet.emergencyInfo?.vetName ?? null,
        vetPhone: pet.emergencyInfo?.vetPhone ?? null,
        emergencyContactName: pet.emergencyInfo?.emergencyContactName ?? null,
        emergencyContactPhone: pet.emergencyInfo?.emergencyContactPhone ?? null
      },
      assessment: {
        latestLabDate,
        labMarkers
      },
      recommendation: {
        vaccinations: vaccinationsList,
        recentMedications: recentMedicationsList
      }
    },
    updatedAt: new Date().toISOString()
  };
}
