import { Suspense } from "react";
import { WorkoutsView } from "../../src/components/views/WorkoutsView";
import { WorkoutsSkeleton } from "../../src/components/skeletons/WorkoutsSkeleton";

export const metadata = {
  title: "PulseFit — Routines ",
  description:
    "Design training routines, split workouts, and log dumbbell repetitions and weights.",
};

export default function WorkoutsPage() {
  return (
    <Suspense fallback={<WorkoutsSkeleton />}>
      <WorkoutsView />
    </Suspense>
  );
}
