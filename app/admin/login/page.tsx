import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginForm, ResetRequestForm } from "@/components/admin-login-form";
import { getOwnerAccess } from "@/lib/auth";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ reset?: string }> }) {
  const [access, params] = await Promise.all([getOwnerAccess(), searchParams]);
  if (access.status === "owner") redirect("/admin");
  return <main className="admin-auth-page"><Link className="brand" href="/"><span className="brand__mark">OL</span><span className="brand__text">Ottie <em>Luxe</em></span></Link>{access.status === "unconfigured" ? <section className="setup-card"><p className="eyebrow">Setup required</p><h1>Connect the owner studio.</h1><p>The public catalogue is running with safe preview data. To enable secure catalogue editing, add the Supabase URL and publishable key, run the included migration and provision the owner account.</p><ol><li>Create or connect the Supabase project.</li><li>Apply the migration in <code>supabase/migrations</code>.</li><li>Add the owner to Auth and <code>admin_profiles</code>.</li><li>Add the environment variables and redeploy.</li></ol><Link className="button button--secondary" href="/">Return to website</Link></section> : params.reset ? <ResetRequestForm /> : <AdminLoginForm />}</main>;
}
