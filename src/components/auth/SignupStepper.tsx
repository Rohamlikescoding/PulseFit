'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { authApi } from '../../lib/auth/client';
import { useAuthStore } from '../../store/authStore';
import { LEVELS, GOALS, validateAccountStep, validateBodyStep, type FieldErrors } from '../../lib/auth/validation';
import type { ExperienceLevel, FitnessGoal } from '../../types/auth';
import { AuthCard, Field, inputClass } from './ui';

const STEPS = ['Account', 'Body stats', 'Your goal'] as const;

const GOAL_LABELS: Record<FitnessGoal, { title: string; desc: string }> = {
  strength: { title: 'Get stronger', desc: 'Heavier lifts, lower reps' },
  muscle: { title: 'Build muscle', desc: 'Hypertrophy focus' },
  'fat-loss': { title: 'Lose fat', desc: 'Lean out, keep muscle' },
  endurance: { title: 'Endurance', desc: 'Conditioning & stamina' },
  mobility: { title: 'Mobility', desc: 'Move better, feel better' },
  general: { title: 'General fitness', desc: 'Stay active and healthy' },
};

const LEVEL_LABELS: Record<ExperienceLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const cmFromFtIn = (ft: number, inch: number) => (ft * 12 + inch) * 2.54;
const kgFromLb = (lb: number) => lb / 2.20462;

export const SignupStepper: React.FC<{ next: string }> = ({ next }) => {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [weight, setWeight] = useState('');

  const [goal, setGoal] = useState<FitnessGoal | ''>('');
  const [experience, setExperience] = useState<ExperienceLevel | ''>('');

  const bodyValues = () => ({
    age: Number(age),
    heightCm: units === 'metric' ? Number(heightCm) : cmFromFtIn(Number(heightFt), Number(heightIn || 0)),
    weightKg: units === 'metric' ? Number(weight) : kgFromLb(Number(weight)),
  });

  const goNext = () => {
    let e: FieldErrors = {};
    if (step === 0) e = validateAccountStep({ name, email, password, confirmPassword });
    if (step === 1) e = validateBodyStep(bodyValues());
    setErrors(e);
    if (Object.keys(e).length === 0) setStep((s) => s + 1);
  };

  const submit = async () => {
    const e: FieldErrors = {};
    if (!goal) e.goal = 'Pick a goal';
    if (!experience) e.experience = 'Pick your experience level';
    setErrors(e);
    if (Object.keys(e).length || busy) return;

    setBusy(true);
    setFormError(null);
    const b = bodyValues();
    const res = await authApi.signup({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      age: Math.round(b.age),
      heightCm: Math.round(b.heightCm),
      weightKg: Math.round(b.weightKg * 10) / 10,
      goal: goal as FitnessGoal,
      experience: experience as ExperienceLevel,
    });
    if (!res.ok) {
      setBusy(false);
      if (res.fields) {
        setErrors(res.fields as FieldErrors);
        // Jump back to the step that owns the first server-side error.
        if (res.fields.email || res.fields.name || res.fields.password) setStep(0);
        else if (res.fields.age || res.fields.heightCm || res.fields.weightKg) setStep(1);
      }
      setFormError(res.error);
      return;
    }
    setSession(res.session);
    router.replace(next.startsWith('/coach') ? '/' : next);
    router.refresh();
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center py-6">
      <AuthCard wide>
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight font-serif-editorial">Create your account</h1>
          <p className="text-xs text-token-muted">
            Optional: you can always train without one. An account lets coaches tailor plans to you.
          </p>
        </div>

        {/* Progress */}
        <ol className="flex items-center gap-2 mb-7" aria-label="Sign-up progress">
          {STEPS.map((label, i) => (
            <li key={label} className="flex-1" aria-current={i === step ? 'step' : undefined}>
              <div className={`h-1.5 rounded-full transition-colors ${i <= step ? 'bg-[#74a87c]' : 'bg-surface-tertiary'}`} />
              <span className={`mt-1.5 block text-[11px] font-mono uppercase tracking-wider ${i === step ? 'text-accent-brand font-bold' : 'text-token-muted'}`}>
                {i + 1}. {label}
              </span>
            </li>
          ))}
        </ol>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            step < STEPS.length - 1 ? goNext() : submit();
          }}
          className="space-y-4"
          noValidate
        >
          {step === 0 && (
            <>
              <Field label="Full name" htmlFor="name" error={errors.name}>
                <input id="name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </Field>
              <Field label="Email" htmlFor="email" error={errors.email}>
                <input id="email" type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Password" htmlFor="password" error={errors.password} hint="At least 8 characters">
                  <input id="password" type="password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
                </Field>
                <Field label="Confirm password" htmlFor="confirm" error={errors.confirmPassword}>
                  <input id="confirm" type="password" className={inputClass} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
                </Field>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="inline-flex p-1 rounded-full bg-surface-secondary border border-token" role="group" aria-label="Units">
                {(['metric', 'imperial'] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    aria-pressed={units === u}
                    onClick={() => setUnits(u)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all ${units === u ? 'bg-[#74a87c]/20 text-accent-brand' : 'text-token-muted'}`}
                  >
                    {u === 'metric' ? 'cm / kg' : 'ft / lb'}
                  </button>
                ))}
              </div>

              <Field label="Age" htmlFor="age" error={errors.age}>
                <input id="age" type="number" inputMode="numeric" className={inputClass} value={age} onChange={(e) => setAge(e.target.value)} />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {units === 'metric' ? (
                  <Field label="Height (cm)" htmlFor="height" error={errors.heightCm}>
                    <input id="height" type="number" inputMode="decimal" className={inputClass} value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
                  </Field>
                ) : (
                  <Field label="Height (ft / in)" htmlFor="heightFt" error={errors.heightCm}>
                    <div className="flex gap-2">
                      <input id="heightFt" type="number" inputMode="numeric" placeholder="ft" className={inputClass} value={heightFt} onChange={(e) => setHeightFt(e.target.value)} />
                      <input aria-label="Height inches" type="number" inputMode="numeric" placeholder="in" className={inputClass} value={heightIn} onChange={(e) => setHeightIn(e.target.value)} />
                    </div>
                  </Field>
                )}
                <Field label={`Weight (${units === 'metric' ? 'kg' : 'lb'})`} htmlFor="weight" error={errors.weightKg}>
                  <input id="weight" type="number" inputMode="decimal" className={inputClass} value={weight} onChange={(e) => setWeight(e.target.value)} />
                </Field>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <fieldset className="space-y-2">
                <legend className="text-xs font-semibold text-token-secondary mb-2">Main goal</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {GOALS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      aria-pressed={goal === g}
                      onClick={() => setGoal(g)}
                      className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer min-h-[56px] ${
                        goal === g ? 'bg-[#74a87c]/15 border-[#74a87c]/60' : 'bg-surface-secondary border-token hover:border-token-strong'
                      }`}
                    >
                      <span className="flex items-center justify-between text-sm font-bold text-token-primary">
                        {GOAL_LABELS[g].title}
                        {goal === g && <Check className="h-4 w-4 text-accent-brand" />}
                      </span>
                      <span className="text-[11px] text-token-muted">{GOAL_LABELS[g].desc}</span>
                    </button>
                  ))}
                </div>
                {errors.goal && <p role="alert" className="text-[11px] text-[#ffb4ab]">{errors.goal}</p>}
              </fieldset>

              <fieldset className="space-y-2">
                <legend className="text-xs font-semibold text-token-secondary mb-2">Experience</legend>
                <div className="grid grid-cols-3 gap-2.5">
                  {LEVELS.map((l) => (
                    <button
                      key={l}
                      type="button"
                      aria-pressed={experience === l}
                      onClick={() => setExperience(l)}
                      className={`py-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        experience === l ? 'bg-[#74a87c]/15 border-[#74a87c]/60 text-accent-brand' : 'bg-surface-secondary border-token text-token-secondary'
                      }`}
                    >
                      {LEVEL_LABELS[l]}
                    </button>
                  ))}
                </div>
                {errors.experience && <p role="alert" className="text-[11px] text-[#ffb4ab]">{errors.experience}</p>}
              </fieldset>
            </>
          )}

          {formError && (
            <div role="alert" className="text-xs px-3.5 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300">
              {formError}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            {step > 0 ? (
              <button type="button" onClick={() => setStep((s) => s - 1)} className="px-4 min-h-[48px] rounded-2xl btn-secondary-token text-xs flex items-center gap-2 cursor-pointer">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            ) : (
              <Link href="/login" className="text-xs text-token-muted hover:text-token-primary">Already have an account?</Link>
            )}
            <button type="submit" disabled={busy} className="px-6 min-h-[52px] rounded-2xl btn-primary-token text-sm flex items-center gap-2 cursor-pointer">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {step < STEPS.length - 1 ? (<>Continue <ArrowRight className="h-4 w-4" /></>) : 'Create account'}
            </button>
          </div>
        </form>
      </AuthCard>
    </div>
  );
};
