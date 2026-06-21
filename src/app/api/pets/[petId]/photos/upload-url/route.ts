import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { requireCreateAccess } from "@/lib/billing/access-guard";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import { badRequest, serverError } from "@/lib/api-error";

const PET_PHOTO_BUCKET = "pet-photos";

const petIdParamSchema = z.object({
  petId: z.string().uuid()
});

const uploadRequestSchema = z.object({
  fileName: z.string().min(1).max(255),
  contentType: z.string().regex(/^image\//)
});

export async function POST(request: Request, { params }: { params: Promise<{ petId: string }> }) {
  const parsedParams = petIdParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    return badRequest(parsedParams.error);
  }

  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }
  const createAccess = await requireCreateAccess(auth.userId);
  if (createAccess instanceof NextResponse) {
    return createAccess;
  }

  const access = await requirePetAccess(auth.userId, parsedParams.data.petId);
  if (access instanceof NextResponse) {
    return access;
  }

  const body = await request.json();
  const parsed = uploadRequestSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(parsed.error);
  }

  const safeFileName = parsed.data.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `pets/${access.petId}/${Date.now()}-${crypto.randomUUID()}-${safeFileName}`;

  const supabase = createSupabaseServiceRoleClient();
  const storage = supabase.storage.from(PET_PHOTO_BUCKET);

  let { data, error } = await storage.createSignedUploadUrl(path);

  if (error?.message?.toLowerCase().includes("related resource does not exist")) {
    const { error: createBucketError } = await supabase.storage.createBucket(PET_PHOTO_BUCKET, {
      public: true
    });

    // Ignore duplicate-like failures and retry signed URL issuance once.
    if (!createBucketError || createBucketError.message.toLowerCase().includes("already")) {
      const retried = await storage.createSignedUploadUrl(path);
      data = retried.data;
      error = retried.error;
    }
  }

  if (error || !data) {
    const detail = error?.message ?? "unknown";
    const hint = detail.toLowerCase().includes("bucket")
      ? `Storage bucket '${PET_PHOTO_BUCKET}' の存在・権限を確認してください`
      : "Supabase接続設定（URL/Service Role Key）とネットワーク到達性を確認してください";
    return serverError(`Failed to issue signed upload url: ${detail}. ${hint}`);
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
