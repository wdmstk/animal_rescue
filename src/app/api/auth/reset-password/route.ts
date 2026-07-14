import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { passwordResetSchema } from "@/lib/validators/auth";
import { badRequest, unauthorized, serverError } from "@/lib/api-error";

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    const body = await req.json().catch(() => null);
    const parsed = passwordResetSchema.safeParse(body);
    
    if (!parsed.success) {
      return badRequest(parsed.error.errors[0].message);
    }
    
    const { password } = parsed.data;
    
    // Get user from Supabase Auth (uses the temp JWT from the reset link)
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return unauthorized("Invalid or expired reset token");
    }
    
    // Update user password
    const { error: updateError } = await supabase.auth.updateUser({ password });
    
    if (updateError) {
      console.error("Password update error:", updateError);
      return serverError("Failed to update password");
    }
    
    return NextResponse.json({
      message: "Password updated successfully.",
      redirectUrl: "/pets"
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return serverError("Internal Server Error");
  }
}