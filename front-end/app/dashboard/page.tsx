import { Suspense } from "react";
import { DashboardView } from "../../src/components/views/DashboardView";
import { DashboardSkeleton } from "../../src/components/skeletons/DashboardSkeleton";

export const metadata = {
  title: "PulseFit — Analytics ",
  description:
    "52-week training consistency heatmap, volume distribution, and strength progression.",
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardView />
    </Suspense>
  );
}
