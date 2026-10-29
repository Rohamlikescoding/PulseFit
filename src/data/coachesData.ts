import type { FitnessGoal } from '../types/auth';

export interface CoachProfile {
  id: string;
  name: string;
  title: string;
  photo: string;
  rating: number;
  reviews: number;
  clients: number;
  pricePerMonth: number;
  specialties: string[];
  goals: FitnessGoal[];
  bio: string;
}

// Placeholder data + portrait photos (randomuser.me). Swap for the real coaches API later.
export const COACHES: CoachProfile[] = [
  {
    id: 'coach-maya',
    name: 'Maya Lindqvist',
    title: 'Strength & Powerlifting Coach',
    photo: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 4.9,
    reviews: 212,
    clients: 38,
    pricePerMonth: 89,
    specialties: ['Strength', 'Barbell', 'Technique'],
    goals: ['strength', 'muscle'],
    bio: 'Ten years coaching raw lifters from first squat to first meet.',
  },
  {
    id: 'coach-daniel',
    name: 'Daniel Okafor',
    title: 'Body Recomposition Specialist',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 4.8,
    reviews: 167,
    clients: 44,
    pricePerMonth: 79,
    specialties: ['Fat loss', 'Hypertrophy', 'Nutrition'],
    goals: ['fat-loss', 'muscle'],
    bio: 'Sustainable fat loss without losing the muscle you worked for.',
  },
  {
    id: 'coach-sofia',
    name: 'Sofia Ramirez',
    title: 'Mobility & Movement Coach',
    photo: 'https://randomuser.me/api/portraits/women/68.jpg',
    rating: 4.9,
    reviews: 98,
    clients: 27,
    pricePerMonth: 69,
    specialties: ['Mobility', 'Recovery', 'Yoga flow'],
    goals: ['mobility', 'general'],
    bio: 'Move pain-free first, then get strong. Gentle, structured progress.',
  },
  {
    id: 'coach-kenji',
    name: 'Kenji Watanabe',
    title: 'Endurance & Conditioning Coach',
    photo: 'https://randomuser.me/api/portraits/men/75.jpg',
    rating: 4.7,
    reviews: 131,
    clients: 31,
    pricePerMonth: 74,
    specialties: ['Running', 'HIIT', 'Stamina'],
    goals: ['endurance', 'fat-loss', 'general'],
    bio: 'Marathon finisher turned coach. Build an engine that lasts.',
  },
];

export interface CoachClient {
  id: string;
  name: string;
  photo: string;
  program: string;
  adherence: number; // 0-100
  lastSession: string;
  status: 'on-track' | 'needs-attention' | 'new';
}

export const COACH_CLIENTS: CoachClient[] = [
  { id: 'c1', name: 'Emma Hartley', photo: 'https://randomuser.me/api/portraits/women/12.jpg', program: 'Upper/Lower 4-day', adherence: 94, lastSession: 'Today', status: 'on-track' },
  { id: 'c2', name: 'Liam Novak', photo: 'https://randomuser.me/api/portraits/men/20.jpg', program: 'Push/Pull/Legs', adherence: 61, lastSession: '4 days ago', status: 'needs-attention' },
  { id: 'c3', name: 'Aisha Rahman', photo: 'https://randomuser.me/api/portraits/women/26.jpg', program: 'Full body 3-day', adherence: 88, lastSession: 'Yesterday', status: 'on-track' },
  { id: 'c4', name: 'Tomás Reyes', photo: 'https://randomuser.me/api/portraits/men/54.jpg', program: 'Strength base', adherence: 100, lastSession: 'Today', status: 'new' },
  { id: 'c5', name: 'Hannah Berg', photo: 'https://randomuser.me/api/portraits/women/79.jpg', program: 'Mobility reset', adherence: 47, lastSession: '9 days ago', status: 'needs-attention' },
];
