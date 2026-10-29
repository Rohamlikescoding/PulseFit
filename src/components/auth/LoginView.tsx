"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, Leaf, Loader2 } from "lucide-react";
import { authApi } from "../../lib/auth/client";
import { useAuthStore } from "../../store/authStore";
import { AuthCard, Field, inputClass } from "./ui";

type Role = "user" | "coach";

export const LoginView: React.FC<{ initialRole: Role; next: string }> = ({
  initialRole,
  next,
}) => {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [role, setRole] = useState<Role>(initialRole);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const switchRole = (r: Role) => {
    setRole(r);
    setError(null);
    setIdentifier("");
    setPassword("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const res = await authApi.login(role, identifier, password);
    if (!res.ok) {
      setError(res.error);
      setBusy(false);
      return;
    }
    setSession(res.session);
    // Coaches go to the coach app; users go back to where they came from.
    const dest =
      role === "coach"
        ? next.startsWith("/coach")
          ? next
          : "/coach"
        : next.startsWith("/coach")
          ? "/"
          : next;
    router.replace(dest);
    router.refresh();
  };

  const isCoach = role === "coach";

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center py-6">
      <AuthCard>
        <div className="text-center space-y-1 mb-6">
          <div className="mx-auto h-10 w-10 rounded-xl bg-[#74a87c] text-[#0e1511] flex items-center justify-center mb-3">
            <Leaf className="h-5 w-5 fill-current" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight font-serif-editorial">
            Welcome back
          </h1>
          <p className="text-xs text-token-muted">
            Log in to sync your training with coaches.
          </p>
        </div>

        {/* Pill switcher */}
        <div
          role="tablist"
          aria-label="Login type"
          className="grid grid-cols-2 p-1 rounded-full bg-surface-secondary border border-token mb-6"
        >
          {(
            [
              ["user", "User", User],
              ["coach", "Coach", ShieldCheck],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={role === id}
              onClick={() => switchRole(id)}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                role === id
                  ? "bg-[#74a87c]/20 text-accent-brand border border-accent-token shadow-sm"
                  : "text-token-muted hover:text-token-primary border border-transparent"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field
            label={isCoach ? "Coach username" : "Email"}
            htmlFor="identifier"
          >
            <input
              id="identifier"
              className={inputClass}
              type={isCoach ? "text" : "email"}
              autoComplete={isCoach ? "username" : "email"}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={isCoach ? "username" : "you@example.com"}
              required
            />
          </Field>
          <Field label="Password" htmlFor="password">
            <input
              id="password"
              className={inputClass}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>

          {error && (
            <div
              role="alert"
              className="text-xs px-3.5 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy || !identifier || !password}
            className="w-full min-h-[52px] rounded-2xl btn-primary-token text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{isCoach ? "Enter coach app" : "Log in"}</span>
          </button>
        </form>

        {isCoach ? (
          <p className="text-[11px] text-token-muted text-center mt-5">
            Coach accounts are issued by PulseFit. Self-service coach sign-up
            isn’t available yet.
          </p>
        ) : (
          <p className="text-xs text-token-muted text-center mt-5">
            New here?{" "}
            <Link
              href={`/signup${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="font-semibold text-accent-brand hover:underline"
            >
              Create an account
            </Link>
          </p>
        )}

        <p className="text-[11px] text-token-muted text-center mt-4">
          <Link href="/" className="hover:text-token-primary">
            Continue without an account →
          </Link>
        </p>
      </AuthCard>
    </div>
  );
};
