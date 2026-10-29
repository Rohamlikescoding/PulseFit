import type { SignupInput, FitnessGoal, ExperienceLevel } from '../../types/auth';

export const GOALS: FitnessGoal[] = ['strength', 'muscle', 'fat-loss', 'endurance', 'mobility', 'general'];
export const LEVELS: ExperienceLevel[] = ['beginner', 'intermediate', 'advanced'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const LIMITS = {
  age: { min: 13, max: 100 },
  heightCm: { min: 100, max: 250 },
  weightKg: { min: 30, max: 300 },
  passwordMin: 8,
} as const;

export type FieldErrors = Partial<Record<keyof SignupInput | 'confirmPassword', string>>;

export function validateAccountStep(v: { name: string; email: string; password: string; confirmPassword?: string }): FieldErrors {
  const e: FieldErrors = {};
  if (v.name.trim().length < 2) e.name = 'Please enter your name';
  if (!EMAIL_RE.test(v.email.trim())) e.email = 'Enter a valid email address';
  if (v.password.length < LIMITS.passwordMin) e.password = `Use at least ${LIMITS.passwordMin} characters`;
  if (v.confirmPassword !== undefined && v.confirmPassword !== v.password) e.confirmPassword = 'Passwords do not match';
  return e;
}

export function validateBodyStep(v: { age: number; heightCm: number; weightKg: number }): FieldErrors {
  const e: FieldErrors = {};
  if (!Number.isFinite(v.age) || v.age < LIMITS.age.min || v.age > LIMITS.age.max)
    e.age = `Age must be between ${LIMITS.age.min} and ${LIMITS.age.max}`;
  if (!Number.isFinite(v.heightCm) || v.heightCm < LIMITS.heightCm.min || v.heightCm > LIMITS.heightCm.max)
    e.heightCm = 'Enter a realistic height';
  if (!Number.isFinite(v.weightKg) || v.weightKg < LIMITS.weightKg.min || v.weightKg > LIMITS.weightKg.max)
    e.weightKg = 'Enter a realistic weight';
  return e;
}

/** Full server-side validation of a signup payload (never trust the client). */
export function validateSignup(input: unknown): { ok: true; value: SignupInput } | { ok: false; errors: FieldErrors } {
  const b = (input ?? {}) as Record<string, unknown>;
  const value: SignupInput = {
    name: String(b.name ?? '').trim(),
    email: String(b.email ?? '').trim().toLowerCase(),
    password: String(b.password ?? ''),
    age: Number(b.age),
    heightCm: Number(b.heightCm),
    weightKg: Number(b.weightKg),
    goal: b.goal as FitnessGoal,
    experience: b.experience as ExperienceLevel,
  };
  const errors: FieldErrors = {
    ...validateAccountStep(value),
    ...validateBodyStep(value),
  };
  if (!GOALS.includes(value.goal)) errors.goal = 'Pick a goal';
  if (!LEVELS.includes(value.experience)) errors.experience = 'Pick your experience level';
  if (value.name.length > 80) errors.name = 'Name is too long';
  if (value.password.length > 200) errors.password = 'Password is too long';
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}
