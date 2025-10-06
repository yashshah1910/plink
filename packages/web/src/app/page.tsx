import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { HowItWorksSection } from '@/components/how-it-works-section';
import { FeaturesSection } from '@/components/features-section';
import { TrustSecuritySection } from '@/components/trust-security-section';
import { FinalCTASection } from '@/components/final-cta-section';
import { Footer } from '@/components/footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <TrustSecuritySection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
}