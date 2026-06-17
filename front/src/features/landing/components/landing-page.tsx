import { LandingHeader } from "@/features/landing/components/landing-header";
import { LandingHashScroller } from "@/features/landing/components/landing-hash-scroller";
import { HeroSection } from "@/features/landing/components/landing-hero";
import { PlanSection } from "@/features/landing/components/landing-pricing";
import { FaqSection, FeatureSection, FinalCta, ProblemSection, WorkflowSection } from "@/features/landing/components/landing-sections";

export function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <LandingHashScroller />
      <LandingHeader />
      <HeroSection />
      <ProblemSection />
      <FeatureSection />
      <WorkflowSection />
      <PlanSection />
      <FaqSection />
      <FinalCta />
    </main>
  );
}
