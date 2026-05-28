import { LandingHeader } from "@/features/landing/components/landing-header";
import { HeroSection } from "@/features/landing/components/landing-hero";
import { PlanSection } from "@/features/landing/components/landing-pricing";
import {
  BeforeAfterSection,
  FaqSection,
  FeatureSection,
  FinalCta,
  MetricsSection,
  ProblemSection,
  TargetUsersSection,
  TrustPrinciplesSection,
  WorkflowSection
} from "@/features/landing/components/landing-sections";

export function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <LandingHeader />
      <HeroSection />
      <TrustPrinciplesSection />
      <MetricsSection />
      <BeforeAfterSection />
      <ProblemSection />
      <FeatureSection />
      <WorkflowSection />
      <TargetUsersSection />
      <PlanSection />
      <FaqSection />
      <FinalCta />
    </main>
  );
}
