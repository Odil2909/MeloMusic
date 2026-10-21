import { Suspense } from "react";
import { HomeContent } from "@/features/home/HomeContent";
import { HomeLoading } from "@/features/home/HomeLoading";
import { WelcomeSection } from "@/components/home/WelcomeSection";

export default function Home() {
  return (
    <div className="home-content">
      <WelcomeSection />
      <Suspense fallback={<HomeLoading />}>
        <HomeContent />
      </Suspense>
    </div>
  );
}
