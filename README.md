# PulseFit Sanctuary

> **Mindful Conditioning, Biophilic Athletic Training, and Personal Fitness Tracking**

PulseFit Sanctuary is an athletic training and mindful fitness center built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Zustand**. It bridges high-performance progressive overload training with restorative, biophilic mindfulness. Designed for athletes who value both physical strength and mental clarity, PulseFit Sanctuary provides friction-free gym floor set logging, custom multi-day routine splits, an interval dual-loop Zen timer, comprehensive volume analytics, and an integrated exercise demonstration catalog.

---

## Table of Contents

- [1. Overview & Philosophy](#1-overview--philosophy)
- [2. Complete Feature Walkthrough](#2-complete-feature-walkthrough)
  - [🌿 Sanctuary Hub (`MainView`)](#-sanctuary-hub-mainview)
  - [🏋️ Routines & Split Planner (`WorkoutsView`)](#️-routines--split-planner-workoutsview)
  - [⚡ Gym Floor Session Logger (`SessionLogger` & `SetGrid`)](#-gym-floor-session-logger-sessionlogger--setgrid)
  - [⏱️ Dual-Loop Zen Interval Timer (`TimerView`)](#️-dual-loop-zen-interval-timer-timerview)
  - [📊 Analytics & Progression Center (`DashboardView`)](#-analytics--progression-center-dashboardview)
  - [📖 Exercise Catalog & Detail Modal](#-exercise-catalog--detail-modal)
  - [🎨 Editorial Design System & Dual Themes](#-editorial-design-system--dual-themes)
- [3. Application Architecture & Tech Stack](#3-application-architecture--tech-stack)
- [4. Project Structure](#4-project-structure)
- [5. Getting Started & Development](#5-getting-started--development)
  - [Prerequisites](#prerequisites)
  - [Installation & Local Run](#installation--local-run)
  - [Build & Typecheck](#build--typecheck)
  - [Environment Variables](#environment-variables)
- [6. Automated Verification & Testing](#6-automated-verification--testing)
- [7. Database Architecture & Field Dictionary](#7-database-architecture--field-dictionary)
  - [Core Database Groups](#core-database-groups)
  - [Exhaustive Database Fields Specification](#exhaustive-database-fields-specification)
  - [Relational Schema (PostgreSQL DDL)](#relational-schema-postgresql-ddl)
- [8. Backend Integration & API Contracts](#8-backend-integration--api-contracts)
  - [Django + PostgreSQL Guide](#django--postgresql-guide)
  - [REST API Endpoints](#rest-api-endpoints)
  - [Frontend API Layer & State Sync](#frontend-api-layer--state-sync)
  - [Offline-First Gym Reliability](#offline-first-gym-reliability)

---

## 1. Overview & Philosophy

Most fitness applications are either overly gamified with loud notifications or rigid spreadsheets with clunky mobile interactions. **PulseFit Sanctuary** was designed from the ground up to solve these pain points:

1. **Mindful Athleticism**: Training is an active sanctuary. Visual aesthetics, soothing tones, and smooth transitions encourage focus and calm exertion rather than sensory fatigue.
2. **Gym-Floor Ergonomics**: Logging sets between heavy barbell presses must take seconds, not minutes. Single-tap checkpoints, automatic ghost comparisons against past session weights, and instant rest interval timers minimize phone distractions.
3. **Data Clarity**: Clean visual heatmaps, volume distribution donuts, and 1RM progression curves surface actionable training trends without spreadsheet complexity.
4. **Dual-Theme Balance**:
   - **Deep Forest Pine (Dark Sanctuary)**: `#0e1511` deep slate background with sage `#9dd3a4` and moss highlights for focused gym environments.
   - **Botanical Sanctuaria (Light Chalk)**: `#f4f6f2` organic paper tone with olive sage `#466645` and crisp contrast for bright spaces.
   - Both themes share consistent editorial typography (`Newsreader` serif headings paired with `Plus Jakarta Sans` body and `JetBrains Mono` numerical metrics).

---

## 2. Complete Feature Walkthrough

### 🌿 Sanctuary Hub (`MainView`)
The primary launchpad of the application:
- **Daily Training Readiness & Streak Tracker**: Displays consecutive workout days and active weekly streak count with biophilic badge styling.
- **Sanctuary Equilibrium Gauge**: A composite biophilic wellness score (0–100) dynamically calculated from weekly training volume, rest compliance, and session completion consistency.
- **"Today's Training Sanctuary" Quick-Launch**: Automatically inspects the active routine split, determines today's scheduled weekday workout (e.g. *Monday Upper Power* or *Legs & Core*), and lets athletes start a live session in one click. If today is a rest day, it provides active recovery suggestions.
- **Quick Links**: Direct shortcuts to the Zen Timer, active split manager, and volume analytics.

### 🏋️ Routines & Split Planner (`WorkoutsView`)
- **Custom Split Creation**: Build multi-day weekly programs (e.g., Push / Pull / Legs, Upper / Lower, 4-Day Hypertrophy, or Full Body).
- **Day-of-Week Mapping**: Assign workouts to specific days (Monday through Sunday) with automatic rest-day detection.
- **Prescribed Exercises**: Add movements from the master exercise library, define target sets (e.g. 3–5 sets), prescribed rep ranges (e.g. 8–12), and optimal rest intervals.
- **Active Routine Activation**: Maintain multiple routines in your library (e.g. Hypertrophy, Strength Peak, Deload) and switch the currently active program with a single toggle.

### ⚡ Gym Floor Session Logger (`SessionLogger` & `SetGrid`)
- **Live Set-by-Set Logging**: Streamlined numerical inputs for load (kg or lb) and completed reps.
- **Previous Performance Ghosting**: Displays the exact load and reps achieved on the same set in previous workouts for progressive overload feedback.
- **One-Tap Checkmarks**: Marking a set as completed records the set timestamp, adds to the total volume counter, and triggers the rest timer.
- **Live Volume & Timer Display**: Real-time counter of total weight moved and session elapsed time.
- **Celebration Feedback**: Completing all prescribed sets and saving triggers a celebratory canvas confetti burst and updates the user's weekly streak.

### ⏱️ Dual-Loop Zen Interval Timer (`TimerView`)
- **Dual-Ring Visualization**:
  - **Outer Continuous Ring**: Displays total workout elapsed duration.
  - **Inner Interval Ring**: Displays the current rest or work loop countdown.
- **Web Audio API Sound Engine**: Zero-asset procedural synthesis creates peaceful Tibetan bowl and wooden block chimes for countdowns and interval transitions.
- **Quick Presets**:
  - *Tabata*: 20s Work / 10s Rest (8 rounds)
  - *HIIT Circuit*: 45s Work / 15s Rest
  - *Strength Rest*: 90s standard or 180s heavy compound recovery
  - *Mindful Flow*: Continuous paced breathing intervals
- **Custom Timer Configuration**: Adjust work time, rest time, and total target rounds with interactive wheel controls.

### 📊 Analytics & Progression Center (`DashboardView`)
- **52-Week Consistency Heatmap**: GitHub-style activity grid visualizing training frequency and volume density over the past calendar year.
- **1RM & Weight Progression Curves (`ProgressionLineChart`)**: Interactive Recharts time-series graph tracking load progression and estimated 1-rep maximums for any selected exercise.
- **Muscle Group Volume Distribution (`VolumePieChart`)**: Donut chart breaking down weekly sets and volume across Chest, Back, Legs, Shoulders, Arms, and Core.
- **Biometric Preferences**: Toggle between Kilograms (`kg`) and Pounds (`lb`), configure default rest intervals, and switch visual themes.

### 📖 Exercise Catalog & Detail Modal
- **Comprehensive Database**: Over 100 preloaded exercises categorized by body part, target muscle, mechanics (compound vs isolation), and equipment.
- **WorkoutAPI Integration**: Real-time search and fallback to live exercise APIs for animated GIF movement demonstrations and biomechanical coaching tips.
- **Exercise Detail Cards**: In-depth modal breaking down primary muscles, secondary synergists, equipment requirements, form execution cues, and injury prevention advice.

### 🎨 Editorial Design System & Dual Themes
- **Consistent Typography**:
  - **Serif Editorial**: `Newsreader` font with historical ligatures and small caps applied to main view titles, card headings, and modal headers.
  - **Clean Sans**: `Plus Jakarta Sans` / `Hanken Grotesk` for ergonomic UI controls and labels.
  - **Precision Mono**: `JetBrains Mono` for timecodes, set counters, and weights.
- **Seamless Dark/Light Switching**: Synchronized across the entire component tree, supporting manual toggle and system OS preference (`prefers-color-scheme`).

---

## 3. Application Architecture & Tech Stack

PulseFit Sanctuary is engineered with a modular, lightweight frontend architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                     PulseFit Sanctuary UI                       │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────┐ │
│  │ Sanctuary Hub │ │ Routines View │ │ Zen Timer     │ │ ... │ │
│  └───────┬───────┘ └───────┬───────┘ └───────┬───────┘ └─────┘ │
└──────────┼─────────────────┼─────────────────┼──────────────────┘
           │                 │                 │
┌──────────▼─────────────────▼─────────────────▼──────────────────┐
│                   Reactive Zustand State Stores                 │
│  ┌───────────────────────────────┐ ┌──────────────────────────┐ │
│  │ workoutStore.ts               │ │ timerStore.ts            │ │
│  │ - Active Routine & Splits     │ │ - Dual-Loop State        │ │
│  │ - Session Logs & History      │ │ - Audio Web Synth        │ │
│  │ - Biometric Settings & Unit   │ │ - Presets & Laps         │ │
│  └───────────────┬───────────────┘ └──────────────────────────┘ │
└──────────────────┼──────────────────────────────────────────────┘
                   │ LocalStorage Persistence & Outbox Queue
┌──────────────────▼──────────────────────────────────────────────┐
│       Browser Storage / Optional Remote Backend (Django REST)   │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Matrix

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | React 19 + TypeScript | Component tree and type-safe application logic |
| **Build Tool** | Vite 8 | Fast HMR dev server and optimized production bundling |
| **Styling** | Tailwind CSS v4 | Modern token-based CSS variables and biophilic styling |
| **State Management** | Zustand 5 | Decoupled stores with typed selector subscriptions and persistence |
| **Visual Charts** | Recharts 3 | Responsive SVG line charts, area charts, and volume donuts |
| **Icons & Motion** | Lucide React + Motion | Feather-light SVG iconography and fluid micro-interactions |
| **Audio** | Web Audio API | Zero-latency procedural sound generation (no external MP3/WAV assets) |
| **Feedback** | Canvas Confetti | Celebration effects upon completing workout sessions |

---

## 4. Project Structure

```
├── .env.example                     # Environment variables template
├── DJANGO_BACKEND_GUIDE.md          # Dedicated Django + PostgreSQL backend implementation guide
├── README.md                        # Master project documentation & database specification
├── index.html                       # HTML5 entry with Google Font preconnects & metadata
├── package.json                     # NPM dependencies and scripts
├── vite.config.ts                   # Vite bundler configuration
│
└── src/
    ├── App.tsx                      # Root component: Theme sync, view router, test runner
    ├── main.tsx                     # React DOM client entrypoint
    ├── index.css                    # Tailwind CSS v4 directives & biophilic color tokens
    │
    ├── components/                  # UI Components
    │   ├── ExerciseDetailModal.tsx  # Biomechanical instructions and animated demonstration GIF
    │   ├── ExerciseSearchModal.tsx  # Filterable catalog search (muscle, equipment, movement)
    │   ├── FloatingBar.tsx          # Mobile-first floating bottom navigation bar
    │   ├── Nav.tsx                  # Desktop header navigation (3-Zone Wordmark, Tabs, Settings)
    │   ├── NotificationHost.tsx     # Toast notifications for scheduled workout reminders
    │   ├── RoutineBuilder.tsx       # Interactive multi-day split and exercise sequence editor
    │   ├── SanctuaryGauge.tsx       # Biophilic training balance & readiness score gauge
    │   ├── SessionLogger.tsx        # Live gym floor set logging interface
    │   ├── SetGrid.tsx              # Grid layout for set numbers, previous loads, reps, and ticks
    │   ├── Timer.tsx                # Dual-loop circular SVG interval timer with Web Audio cues
    │   │
    │   ├── charts/                  # Analytics & Data Visualization
    │   │   ├── HeatMap.tsx          # 52-week training consistency activity grid
    │   │   ├── ProgressionLineChart.tsx # 1RM and load progression line graphs
    │   │   └── VolumePieChart.tsx   # Muscle group volume distribution breakdown
    │   │
    │   └── views/                   # Top-Level Tab Views
    │       ├── DashboardView.tsx    # Volume analytics, progression charts, and user settings
    │       ├── MainView.tsx         # Sanctuary Hub: Readiness score, today's workout, streak
    │       ├── TimerView.tsx        # Dedicated full-screen Zen Timer interface
    │       └── WorkoutsView.tsx     # Routine split list, day preview, and routine builder
    │
    ├── data/                        # Static Curated Exercise Data & Seeds
    │   ├── exercisesData.ts         # Master exercise database with muscles, equipment, cues
    │   └── seedData.ts              # Default routines (PPL, Upper/Lower) and sample history
    │
    ├── lib/                         # Utility Libraries & Verification Suites
    │   ├── api.ts                   # REST API client with Bearer token authentication
    │   ├── exerciseApi.ts           # WorkoutAPI proxy fetcher and caching layer
    │   ├── featureModes.test.ts     # Automated unit tests for feature toggles & settings
    │   ├── schedule.ts              # Day-of-week split mapping & streak calculation algorithms
    │   ├── schedule.test.ts         # Automated test suite for workout scheduling logic
    │   └── storage.ts               # LocalStorage safety wrappers and serialization helpers
    │
    ├── store/                       # Zustand Reactive Stores
    │   ├── timerStore.ts            # Macro/micro timer state, intervals, audio triggers, laps
    │   └── workoutStore.ts          # Routines, session logs, active split, biometric settings
    │
    └── types/                       # TypeScript Type Definitions
        └── workout.ts               # Strict interfaces for Routines, Days, Sets, and Exercises
```

---

## 5. Getting Started & Development

### Prerequisites
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher

### Installation & Local Run

```bash
# 1. Clone the repository
git clone https://github.com/your-username/pulsefit-sanctuary.git
cd pulsefit-sanctuary

# 2. Install dependencies
npm install

# 3. Start the local development server (runs on port 3000)
npm run dev
```

Visit `http://localhost:3000` in your browser. The app will immediately load in offline-first mode with sample seed data.

### Build & Typecheck

```bash
# Run TypeScript type-checking across the entire codebase
npm run lint

# Build production bundle to dist/
npm run build

# Preview production build locally
npm run preview
```

### Environment Variables

Copy `.env.example` to create your local `.env.local` configuration:

```bash
cp .env.example .env.local
```

| Variable | Description | Default / Example |
|---|---|---|
| `WORKOUT_API_KEY` | *(Optional)* API key for live WorkoutAPI exercise queries and GIFs | `""` |
| `VITE_API_BASE_URL` | *(Optional)* Base URL of your backend REST API (Django, Node, etc.) | `"http://127.0.0.1:8000/api"` |

---

## 6. Automated Verification & Testing

PulseFit Sanctuary features automated in-browser verification test suites located in `src/lib/`:

- **`schedule.test.ts`**: Validates the day-of-week routine resolution algorithm, rest day transitions, and multi-week streak logic. Runs automatically on app mount (`App.tsx`).
- **`featureModes.test.ts`**: Verifies unit conversions (`kg` $\leftrightarrow$ `lb`), weight formatting, and theme setting persistence.

To execute tests manually in the console or terminal:
```bash
npm run lint
```

---

## 7. Database Architecture & Field Dictionary

PulseFit Sanctuary manages all workout routines, set logs, and user preferences cleanly across **5 Core Database Groups**. When migrating from browser `localStorage` to an external database (e.g., PostgreSQL via Django or Cloud SQL), use this exact schema specification.

### Core Database Groups

1. **User Identity & Settings**: Account credentials, weight unit preference (`kg`/`lb`), default rest interval duration, and visual theme.
2. **Master Exercise Catalog**: Curated exercises with body part classifications, target muscles, movement biomechanics, and animated demonstration GIFs.
3. **Training Routines & Scheduled Days**: Weekly training splits (e.g. 3-day, 4-day, 6-day PPL) and prescribed exercises per day.
4. **Workout Sessions & Set Logs**: Completed gym floor workouts, individual sets with recorded load, completed reps, and timestamps.
5. **Zen Timer Sessions**: Recorded timer intervals, macro durations, and completed loop laps.

---

### Exhaustive Database Fields Specification

#### 1. `users` Table
| Field Name | Type | Constraints | Description & Example |
|---|---|---|---|
| `id` | `UUID` / `BIGINT` | Primary Key, Auto-gen | Unique user identifier (e.g., `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`) |
| `email` | `VARCHAR(255)` | Unique, Not Null | User login email (e.g., `athlete@sanctuary.app`) |
| `password_hash` | `VARCHAR(255)` | Not Null | Hashed password string (e.g., Argon2 or bcrypt) |
| `display_name` | `VARCHAR(100)` | Nullable | User's preferred name (e.g., `Alex Morgan`) |
| `avatar_url` | `TEXT` | Nullable | Profile image URL |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Default `NOW()` | Timestamp when user registered |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | Default `NOW()` | Timestamp of last profile update |

#### 2. `user_settings` Table
| Field Name | Type | Constraints | Description & Example |
|---|---|---|---|
| `user_id` | `UUID` / `BIGINT` | Primary Key, FK -> `users(id)` ON DELETE CASCADE | Associated user |
| `weight_unit` | `VARCHAR(10)` | Not Null, Default `'kg'`, CHECK `IN ('kg', 'lb')` | Selected unit for gym floor weight tracking (`kg` or `lb`) |
| `default_loop_duration` | `INTEGER` | Not Null, Default `90` | Default rest / interval loop duration in seconds |
| `theme` | `VARCHAR(20)` | Not Null, Default `'dark'`, CHECK `IN ('dark', 'light', 'system')` | Visual theme preference |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | Default `NOW()` | Timestamp of last setting change |

#### 3. `exercises` Table (Master Exercise Catalog & WorkoutAPI Cache)
| Field Name | Type | Constraints | Description & Example |
|---|---|---|---|
| `id` | `VARCHAR(64)` | Primary Key | Canonical exercise slug or WorkoutAPI ID (e.g., `ex_barbell_bench_press`) |
| `name` | `VARCHAR(255)` | Not Null, Indexed | Display name of the exercise (e.g., `Barbell Bench Press`) |
| `body_part` | `VARCHAR(100)` | Not Null, Indexed | Primary anatomical category (e.g., `chest`, `back`, `legs`, `shoulders`, `arms`, `waist`, `cardio`) |
| `target` | `VARCHAR(100)` | Nullable, Indexed | Specific target muscle (e.g., `pectorals`, `lats`, `quadriceps`) |
| `equipment` | `VARCHAR(100)` | Nullable | Equipment required (e.g., `barbell`, `dumbbell`, `cable`, `body weight`) |
| `gif_url` | `TEXT` | Nullable | Direct URL to animated demonstration GIF |
| `difficulty` | `VARCHAR(50)` | Nullable | Skill tier: `beginner`, `intermediate`, or `advanced` |
| `mechanics` | `VARCHAR(50)` | Nullable | Kinetic classification: `compound` or `isolation` |
| `force` | `VARCHAR(50)` | Nullable | Direction of force: `push`, `pull`, or `static` |
| `secondary_muscles` | `JSONB` / Array | Default `[]` | Secondary synergist muscles (e.g., `["triceps", "anterior deltoids"]`) |
| `instructions` | `JSONB` / Array | Default `[]` | Step-by-step form execution instructions (array of text strings) |
| `tips` | `JSONB` / Array | Default `[]` | Biomechanical cues and injury prevention guidelines |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Default `NOW()` | Catalog creation date |

#### 4. `routines` Table (Weekly Workout Programs)
| Field Name | Type | Constraints | Description & Example |
|---|---|---|---|
| `id` | `UUID` / `BIGINT` | Primary Key, Auto-gen | Unique routine ID |
| `user_id` | `UUID` / `BIGINT` | Not Null, FK -> `users(id)` ON DELETE CASCADE, Indexed | Routine owner |
| `name` | `VARCHAR(255)` | Not Null | Routine title (e.g., `Push / Pull / Legs Hypertrophy`) |
| `days_per_week` | `SMALLINT` | Not Null, CHECK `BETWEEN 1 AND 7` | Target training frequency per week (`1` through `7`) |
| `is_active` | `BOOLEAN` | Default `false` | Flag indicating if this routine is the currently active program on the dashboard |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Default `NOW()` | Creation timestamp |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | Default `NOW()` | Last modified timestamp |

#### 5. `workout_days` Table (Scheduled Days within a Routine)
| Field Name | Type | Constraints | Description & Example |
|---|---|---|---|
| `id` | `UUID` / `BIGINT` | Primary Key, Auto-gen | Unique workout day ID |
| `routine_id` | `UUID` / `BIGINT` | Not Null, FK -> `routines(id)` ON DELETE CASCADE, Indexed | Parent routine |
| `weekday` | `SMALLINT` | Not Null, CHECK `BETWEEN 0 AND 6` | Day of week (`0`=Sunday, `1`=Monday, ..., `6`=Saturday) |
| `name` | `VARCHAR(255)` | Not Null | Day label (e.g., `Monday Upper Power`, `Legs & Core`) |
| `sort_order` | `INTEGER` | Default `0` | Order of appearance |

#### 6. `planned_exercises` Table (Prescribed Exercises per Workout Day)
| Field Name | Type | Constraints | Description & Example |
|---|---|---|---|
| `id` | `UUID` / `BIGINT` | Primary Key, Auto-gen | Unique planned exercise ID |
| `workout_day_id` | `UUID` / `BIGINT` | Not Null, FK -> `workout_days(id)` ON DELETE CASCADE, Indexed | Parent workout day |
| `exercise_id` | `VARCHAR(64)` | Nullable, FK -> `exercises(id)` ON DELETE SET NULL | Link to master exercise catalog |
| `exercise_name` | `VARCHAR(255)` | Not Null | Name snapshot (e.g., `Barbell Incline Bench Press`) |
| `gif_url` | `TEXT` | Nullable | Thumbnail / GIF media URL |
| `target_sets` | `INTEGER` | Not Null, Default `3`, CHECK `BETWEEN 1 AND 10` | Planned target sets for this session (e.g., `3` or `4`) |
| `sort_order` | `INTEGER` | Default `0` | Exercise execution sequence |

#### 7. `session_logs` Table (Completed Gym Floor Sessions)
| Field Name | Type | Constraints | Description & Example |
|---|---|---|---|
| `id` | `UUID` / `BIGINT` | Primary Key, Auto-gen | Unique completed session ID |
| `user_id` | `UUID` / `BIGINT` | Not Null, FK -> `users(id)` ON DELETE CASCADE, Indexed | Athlete who performed the workout |
| `routine_id` | `UUID` / `BIGINT` | Nullable, FK -> `routines(id)` ON DELETE SET NULL | Routine this session was logged against |
| `date` | `DATE` | Not Null, Indexed | Calendar date (`YYYY-MM-DD`, e.g., `2026-10-01`) for heatmaps & streaks |
| `routine_name` | `VARCHAR(255)` | Nullable | Snapshot of routine name at time of workout |
| `workout_day_name` | `VARCHAR(255)` | Nullable | Snapshot of scheduled day name (e.g., `Monday Upper Power`) |
| `started_at` | `TIMESTAMP WITH TIME ZONE` | Nullable | Timestamp when first set started |
| `completed_at` | `TIMESTAMP WITH TIME ZONE` | Default `NOW()`, Nullable | Exact completion timestamp |
| `duration_seconds` | `INTEGER` | Default `0` | Total duration elapsed in seconds |
| `notes` | `TEXT` | Nullable | Personal workout feedback or reflections |

#### 8. `exercise_logs` Table (Exercises Performed in a Session)
| Field Name | Type | Constraints | Description & Example |
|---|---|---|---|
| `id` | `UUID` / `BIGINT` | Primary Key, Auto-gen | Unique exercise log ID |
| `session_id` | `UUID` / `BIGINT` | Not Null, FK -> `session_logs(id)` ON DELETE CASCADE, Indexed | Parent session |
| `exercise_id` | `VARCHAR(64)` | Nullable | Canonical exercise identifier |
| `name` | `VARCHAR(255)` | Not Null | Display name (e.g., `Romanian Deadlift`) |
| `body_part` | `VARCHAR(100)` | Nullable | Body part category used for volume distribution analytics (e.g., `legs`, `chest`) |
| `sort_order` | `INTEGER` | Default `0` | Sequence in workout session |

#### 9. `set_logs` Table (Individual Sets with Load, Reps, and Status)
| Field Name | Type | Constraints | Description & Example |
|---|---|---|---|
| `id` | `UUID` / `BIGINT` | Primary Key, Auto-gen | Unique set record ID |
| `exercise_log_id` | `UUID` / `BIGINT` | Not Null, FK -> `exercise_logs(id)` ON DELETE CASCADE, Indexed | Parent exercise log |
| `set_order` | `INTEGER` | Default `0` | Set number in sequence (`1`, `2`, `3`, etc.) |
| `reps` | `INTEGER` | Not Null, Default `0`, CHECK `>= 0` | Repetitions completed (e.g., `10`) |
| `weight` | `NUMERIC(7, 2)` | Not Null, Default `0.00`, CHECK `>= 0` | Load lifted in configured weight unit (e.g., `82.50`) |
| `completed` | `BOOLEAN` | Default `true` | Checkpoint status (checked tick mark on gym floor) |
| `rpe` | `NUMERIC(3, 1)` | Nullable, CHECK `BETWEEN 1.0 AND 10.0` | Rate of Perceived Exertion (optional) |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Default `NOW()` | Timestamp when set was logged |

#### 10. `zen_timer_sessions` Table (Dual-Loop Timer Logs)
| Field Name | Type | Constraints | Description & Example |
|---|---|---|---|
| `id` | `UUID` / `BIGINT` | Primary Key, Auto-gen | Unique timer session ID |
| `user_id` | `UUID` / `BIGINT` | Not Null, FK -> `users(id)` ON DELETE CASCADE, Indexed | User |
| `total_duration_ms` | `BIGINT` | Not Null | Total elapsed duration of outer continuous ring in milliseconds |
| `total_loops` | `INTEGER` | Default `0` | Number of interval loops completed |
| `loop_history` | `JSONB` / Array | Default `[]` | Recorded lap array (e.g., `[{"loop": 1, "durationMs": 90000}]`) |
| `recorded_at` | `TIMESTAMP WITH TIME ZONE` | Default `NOW()` | Session timestamp |

---

### Relational Schema (PostgreSQL DDL)

```sql
-- 1. Users & Settings
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  weight_unit VARCHAR(10) DEFAULT 'kg' CHECK (weight_unit IN ('kg', 'lb')),
  default_loop_duration INT DEFAULT 90,
  theme VARCHAR(20) DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Master Exercise Catalog
CREATE TABLE exercises (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  body_part VARCHAR(100) NOT NULL,
  target VARCHAR(100),
  equipment VARCHAR(100),
  gif_url TEXT,
  difficulty VARCHAR(50),
  mechanics VARCHAR(50),
  force VARCHAR(50),
  secondary_muscles JSONB DEFAULT '[]'::jsonb,
  instructions JSONB DEFAULT '[]'::jsonb,
  tips JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_exercises_body_part ON exercises(body_part);
CREATE INDEX idx_exercises_target ON exercises(target);

-- 3. Routines & Weekly Splits
CREATE TABLE routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  days_per_week INT NOT NULL CHECK (days_per_week BETWEEN 1 AND 7),
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_routines_user_id ON routines(user_id);

CREATE TABLE workout_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  name VARCHAR(255) NOT NULL,
  sort_order INT DEFAULT 0
);
CREATE INDEX idx_workout_days_routine ON workout_days(routine_id);

CREATE TABLE planned_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_day_id UUID NOT NULL REFERENCES workout_days(id) ON DELETE CASCADE,
  exercise_id VARCHAR(64) REFERENCES exercises(id) ON DELETE SET NULL,
  exercise_name VARCHAR(255) NOT NULL,
  gif_url TEXT,
  target_sets INT NOT NULL DEFAULT 3 CHECK (target_sets BETWEEN 1 AND 10),
  sort_order INT DEFAULT 0
);
CREATE INDEX idx_planned_exercises_day ON planned_exercises(workout_day_id);

-- 4. Completed Workout Sessions & Set Logs
CREATE TABLE session_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  routine_id UUID REFERENCES routines(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  routine_name VARCHAR(255),
  workout_day_name VARCHAR(255),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_seconds INT DEFAULT 0,
  notes TEXT
);
CREATE INDEX idx_session_logs_user_date ON session_logs(user_id, date);

CREATE TABLE exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES session_logs(id) ON DELETE CASCADE,
  exercise_id VARCHAR(64),
  name VARCHAR(255) NOT NULL,
  body_part VARCHAR(100),
  sort_order INT DEFAULT 0
);
CREATE INDEX idx_exercise_logs_session ON exercise_logs(session_id);

CREATE TABLE set_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_log_id UUID NOT NULL REFERENCES exercise_logs(id) ON DELETE CASCADE,
  set_order INT DEFAULT 0,
  reps INT NOT NULL DEFAULT 0 CHECK (reps >= 0),
  weight NUMERIC(7, 2) NOT NULL DEFAULT 0.00 CHECK (weight >= 0),
  completed BOOLEAN DEFAULT true,
  rpe NUMERIC(3, 1) CHECK (rpe BETWEEN 1.0 AND 10.0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_set_logs_exercise ON set_logs(exercise_log_id);

-- 5. Zen Timer Sessions
CREATE TABLE zen_timer_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_duration_ms BIGINT NOT NULL,
  total_loops INT DEFAULT 0,
  loop_history JSONB DEFAULT '[]'::jsonb,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_zen_timer_user ON zen_timer_sessions(user_id);
```

---

## 8. Backend Integration & API Contracts

PulseFit Sanctuary is fully decoupled: it operates seamlessly in standalone browser mode with `localStorage`, and can effortlessly sync with an external REST backend.

### Django + PostgreSQL Guide
For complete implementation with Python Django, Django REST Framework (DRF), and PostgreSQL:
👉 [**Read the Django + PostgreSQL Backend Guide (`DJANGO_BACKEND_GUIDE.md`)**](./DJANGO_BACKEND_GUIDE.md)

The guide includes:
- Production `settings.py` (CORS, JWT authentication, PostgreSQL pooling)
- Complete `workouts/models.py` matching the schema above
- DRF nested serializers in `workouts/serializers.py`
- ViewSets with analytics endpoints (`workouts/views.py`)
- URL routing & migration scripts

---

### REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register/` | Register new user account |
| `POST` | `/api/auth/token/` | Obtain JWT access and refresh tokens |
| `GET` / `PUT` | `/api/settings/` | Retrieve or update user preferences (unit, theme, rest) |
| `GET` / `POST` | `/api/routines/` | List user routines or create a new routine split |
| `PUT` | `/api/routines/{id}/activate/` | Set the active routine split for the athlete |
| `GET` / `POST` | `/api/sessions/` | List workout history or submit a completed gym session |
| `GET` | `/api/sessions/recent/` | Fetch recent sessions to populate ghost weights on set grids |
| `GET` | `/api/analytics/streak/` | Calculate training streaks and 52-week activity heatmap |
| `GET` | `/api/analytics/progression/?exerciseId={id}` | Retrieve historical 1RM and volume curves for an exercise |
| `GET` | `/api/exercises/` | Search master exercise catalog with muscle & equipment filters |

---

### Frontend API Layer & State Sync

The frontend includes a typed HTTP client layer in `src/lib/api.ts`:

```typescript
// src/lib/api.ts
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('access_token');
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, { credentials: 'include', ...options, headers });
  if (!response.ok) {
    throw new Error(`API Error ${response.status}: ${await response.text()}`);
  }
  return response.json();
}
```

#### Syncing Zustand Store with Remote Backend
To connect the local store to your backend:
1. Set `VITE_API_BASE_URL="http://127.0.0.1:8000/api"` in `.env.local`.
2. In `src/store/workoutStore.ts`, trigger `apiRequest('/sessions/', { method: 'POST', body: JSON.stringify(session) })` inside `saveSessionLog()`.
3. Keep optimistic updates so that even if the network drops on the gym floor, the user experiences instantaneous UI feedback.

---

### Offline-First Gym Reliability

Gym basements often suffer from poor cellular connectivity. PulseFit Sanctuary addresses this with:
- **Zero-Latency Local Persistence**: All active routines, ongoing session sets, and preferences write immediately to `localStorage`.
- **Outbox Queue Pattern**: When offline, completed sessions are stored in an indexed outbox array and automatically flushed to the server once `window.addEventListener('online')` fires.
- **Audio Without Network**: Web Audio API bells and countdown chimes are generated procedurally on the device CPU, requiring zero network bandwidth.

---

## 9. License

This project is licensed under the MIT License. Feel free to customize, extend, and build your ideal training sanctuary.
