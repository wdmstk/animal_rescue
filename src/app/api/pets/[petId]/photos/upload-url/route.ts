import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";

const PET_PHOTO_BUCKET = "pet-photos";

const petIdParamSchema = z.object({
  petId: z.string().uuid()
});

const uploadRequestSchema = z.object({
  fileName: z.string().min(1).max(255),
  contentType: z.string().regex(/^image\//)
});

export async function POST(request: Request, { params }: { params: { petId: string } }) {
  const parsedParams = petIdParamSchema.safeParse(params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.flatten() }, { status: 400 });
  }

  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const access = await requirePetAccess(auth.userId, parsedParams.data.petId);
  if (access instanceof NextResponse) {
    return access;
  }

  const body = await request.json();
  const parsed = uploadRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const safeFileName = parsed.data.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `pets/${access.petId}/${Date.now()}-${crypto.randomUUID()}-${safeFileName}`;

  const supabase = createSupabaseServiceRoleClient();
  const storage = supabase.storage.from(PET_PHOTO_BUCKET);

  const { data, error } = await storage.createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json({ error: "Failed to issue signed upload url" }, { status: 500 });
  }

  const { data: publicUrlData } = storage.getPublicUrl(path);

  return NextResponse.json({
    data: {
      bucket: PET_PHOTO_BUCKET,
      path,
      signedUrl: data.signedUrl,
      publicUrl: publicUrlData.publicUrl
    }
  });
}
