import { Suspense } from "react";
import { TimerView } from "../../src/components/views/TimerView";
import { TimerSkeleton } from "../../src/components/skeletons/TimerSkeleton";

export const metadata = {
  title: "PulseFit — Timer",
  description: "Dual-loop interval flow timer with Web Audio loop transitions.",
};

export default function TimerPage() {
  return (
    <Suspense fallback={<TimerSkeleton />}>
      <TimerView />
    </Suspense>
  );
}
