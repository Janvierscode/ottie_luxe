import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type OwnerAccess =
  | { status: "unconfigured"; email: null }
  | { status: "signed_out"; email: null }
  | { status: "forbidden"; email: string | null }
  | { status: "owner"; email: string | null; userId: string };

export async function getOwnerAccess(): Promise<OwnerAccess> {
  if (!isSupabaseConfigured()) return { status: "unconfigured", email: null };
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase!.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  const email = typeof claimsData?.claims?.email === "string" ? claimsData.claims.email : null;
  if (claimsError || !userId) return { status: "signed_out", email: null };
  const { data: profile } = await supabase!
    .from("admin_profiles")
    .select("user_id, active")
    .eq("user_id", userId)
    .eq("active", true)
    .maybeSingle();
  if (!profile) return { status: "forbidden", email };
  return { status: "owner", email, userId };
}

export async function requireOwner() {
  const access = await getOwnerAccess();
  if (access.status !== "owner") throw new Error("Owner access is required for this action.");
  const supabase = await createClient();
  return { supabase: supabase!, access };
}
