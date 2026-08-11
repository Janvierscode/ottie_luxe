"use client";

import Link from "next/link";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useActionState, useState } from "react";
import { loginAction, requestResetAction, updatePasswordAction } from "@/app/admin/login/actions";

const initial = { ok: false, message: "" };

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);
  const [show, setShow] = useState(false);
  return (
    <form action={action} className="admin-auth-form">
      <div className="admin-auth-icon"><LockKeyhole /></div>
      <div><p className="eyebrow">Owner access</p><h1>Welcome back.</h1><p>Sign in to manage products, availability and offers.</p></div>
      <label>Email address<input name="email" type="email" autoComplete="username" required /></label>
      <label>Password<span className="password-field"><input name="password" type={show ? "text" : "password"} autoComplete="current-password" minLength={8} required /><button type="button" onClick={() => setShow((value) => !value)} aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff /> : <Eye />}</button></span></label>
      {state.message && <p className={`form-message ${state.ok ? "is-success" : "is-error"}`} role="alert">{state.message}</p>}
      <button className="button button--full" type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in securely"}</button>
      <Link className="text-link" href="/admin/login?reset=1">Forgot your password?</Link>
    </form>
  );
}

export function ResetRequestForm() {
  const [state, action, pending] = useActionState(requestResetAction, initial);
  return <form action={action} className="admin-auth-form"><div><p className="eyebrow">Account recovery</p><h1>Reset your password.</h1><p>We will email the owner account a secure reset link.</p></div><label>Owner email<input name="email" type="email" autoComplete="email" required /></label>{state.message && <p className={`form-message ${state.ok ? "is-success" : "is-error"}`} role="status">{state.message}</p>}<button className="button button--full" type="submit" disabled={pending}>{pending ? "Sending…" : "Send reset link"}</button><Link className="text-link" href="/admin/login">Back to sign in</Link></form>;
}

export function UpdatePasswordForm() {
  const [state, action, pending] = useActionState(updatePasswordAction, initial);
  return <form action={action} className="admin-auth-form"><div><p className="eyebrow">New password</p><h1>Secure your account.</h1><p>Use at least 10 characters and avoid reusing an old password.</p></div><label>New password<input name="password" type="password" autoComplete="new-password" minLength={10} required /></label>{state.message && <p className={`form-message ${state.ok ? "is-success" : "is-error"}`} role="status">{state.message}</p>}<button className="button button--full" type="submit" disabled={pending}>{pending ? "Updating…" : "Update password"}</button>{state.ok && <Link className="text-link" href="/admin">Return to dashboard</Link>}</form>;
}
