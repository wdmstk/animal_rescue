import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { requireCreateAccess } from "@/lib/billing/access-guard";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";

const PET_PHOTO_BUCKET = "pet-photos";

const petIdParamSchema = z.object({
  petId: z.string().uuid()
});

export async function POST(request: Request, { params }: { params: Promise<{ petId: string }> }) {
  const parsedParams = petIdParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.flatten() }, { status: 400 });
  }

  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) return auth;

  const createAccess = await requireCreateAccess(auth.userId);
  if (createAccess instanceof NextResponse) return createAccess;

  const access = await requirePetAccess(auth.userId, parsedParams.data.petId);
  if (access instanceof NextResponse) return access;

  const formData = await request.formData();
  const fileValue = formData.get("file");
  if (!(fileValue instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  if (!fileValue.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }

  const safeFileName = fileValue.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `medical-docs/${access.petId}/${Date.now()}-${crypto.randomUUID()}-${safeFileName}`;

  const supabase = createSupabaseServiceRoleClient();
  const storage = supabase.storage.from(PET_PHOTO_BUCKET);

  let uploadResult = await storage.upload(path, fileValue, {
    contentType: fileValue.type,
    upsert: false
  });

  if (uploadResult.error?.message?.toLowerCase().includes("related resource does not exist")) {
    const { error: createBucketError } = await supabase.storage.createBucket(PET_PHOTO_BUCKET, {
      public: true
    });

    if (!createBucketError || createBucketError.message.toLowerCase().includes("already")) {
      uploadResult = await storage.upload(path, fileValue, {
        contentType: fileValue.type,
        upsert: false
      });
    }
  }

  if (uploadResult.error) {
    return NextResponse.json({ error: uploadResult.error.message }, { status: 500 });
  }

  const { data: publicUrlData } = storage.getPublicUrl(path);

  return NextResponse.json({
    data: {
      path,
      publicUrl: publicUrlData.publicUrl
    }
  });
}
