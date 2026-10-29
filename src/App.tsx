import { Suspense } from "react";
import { WelcomeSection } from "@/components/home/WelcomeSection";
import { HomeContent } from "@/features/home/HomeContent";
import { HomeLoading } from "@/features/home/HomeLoading";

export default function App() {
  return (
    <div className="home-content">
      <WelcomeSection />
      <Suspense fallback={<HomeLoading />}>
        <HomeContent />
      </Suspense>
    </div>
  );
}
