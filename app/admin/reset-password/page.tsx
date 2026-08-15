import { redirect } from "next/navigation";
import { UpdatePasswordForm } from "@/components/admin-login-form";
import { getOwnerAccess } from "@/lib/auth";

export default async function ResetPasswordPage() {
  const access = await getOwnerAccess();
  if (access.status === "unconfigured" || access.status === "signed_out") redirect("/admin/login");
  return <main className="admin-auth-page"><UpdatePasswordForm /></main>;
}
