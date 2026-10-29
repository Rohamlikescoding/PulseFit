import { Suspense } from "react";
import { MainView } from "../src/components/views/MainView";
import { HomeSkeleton } from "../src/components/skeletons/HomeSkeleton";

export const metadata = {
  title: "PulseFit — Overview",
  description:
    "Track daily training streaks, today’s workout, and sanctuary equilibrium.",
};

export default function HomePage() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <MainView />
    </Suspense>
  );
}
