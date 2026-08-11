"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site-config";
import type { AdminActionState } from "@/app/admin/actions";

export async function loginAction(_previous: AdminActionState, formData: FormData): Promise<AdminActionState> {
  if (!isSupabaseConfigured()) return { ok: false, message: "Connect Supabase before signing in." };
  const parsed = z.object({ email: z.string().email(), password: z.string().min(8) }).safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { ok: false, message: "Enter a valid email and password." };
  const supabase = await createClient();
  const { error } = await supabase!.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, message: "The email or password is incorrect." };
  redirect("/admin");
}

export async function requestResetAction(_previous: AdminActionState, formData: FormData): Promise<AdminActionState> {
  if (!isSupabaseConfigured()) return { ok: false, message: "Connect Supabase before requesting a reset." };
  const email = z.string().email().safeParse(formData.get("email"));
  if (!email.success) return { ok: false, message: "Enter the owner email address." };
  const supabase = await createClient();
  await supabase!.auth.resetPasswordForEmail(email.data, { redirectTo: `${SITE_URL}/auth/callback?next=/admin/reset-password` });
  return { ok: true, message: "If that owner account exists, a reset link has been sent." };
}

export async function updatePasswordAction(_previous: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const password = z.string().min(10).safeParse(formData.get("password"));
  if (!password.success) return { ok: false, message: "Use a password with at least 10 characters." };
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: "Supabase is not connected." };
  const { error } = await supabase.auth.updateUser({ password: password.data });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Password updated. You can return to the dashboard." };
}
