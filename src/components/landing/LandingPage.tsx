import { LandingNav } from './LandingNav';
import { LandingHero } from './LandingHero';
import { ProductPreview } from './ProductPreview';
import { PhilosophySections } from './PhilosophySections';

interface LandingPageProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

export function LandingPage({ onSignIn, onSignUp }: LandingPageProps) {
  const scrollToPreview = () => {
    const el = document.getElementById('preview');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-dvh bg-canvas text-zinc-100 selection:bg-accent/30 selection:text-white relative">
      {/* Background Decorative Radial Gradient */}
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(129,140,248,0.12),rgba(255,255,255,0))] -z-10"
        aria-hidden="true"
      />

      {/* Navigation */}
      <LandingNav onSignIn={onSignIn} onSignUp={onSignUp} />

      <main className="relative pb-16">
        {/* Hero */}
        <LandingHero onSignUp={onSignUp} onExplore={scrollToPreview} />

        {/* Product Preview Mockup */}
        <ProductPreview onStartSkill={onSignUp} />

        {/* Philosophy, How It Works, Compounding, Disciplines, 100h, CTA */}
        <PhilosophySections onSignUp={onSignUp} />
      </main>
    </div>
  );
}
