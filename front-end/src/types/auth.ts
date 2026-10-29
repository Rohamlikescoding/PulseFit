export type FitnessGoal = 'strength' | 'muscle' | 'fat-loss' | 'endurance' | 'mobility' | 'general';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  age: number;
  heightCm: number;
  weightKg: number;
  goal: FitnessGoal;
  experience: ExperienceLevel;
}

/** Everything about a user that is safe to send to the browser. */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  age: number;
  heightCm: number;
  weightKg: number;
  goal: FitnessGoal;
  experience: ExperienceLevel;
  createdAt: string;
}

export type ClientSession =
  | { role: 'user'; user: PublicUser }
  | { role: 'coach'; name: string };
