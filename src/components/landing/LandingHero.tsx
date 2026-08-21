import { Button } from '../ui/Button';
import { ArrowRight, Play, Sparkles, ShieldCheck } from 'lucide-react';

interface LandingHeroProps {
  onSignUp: () => void;
  onExplore: () => void;
}

export function LandingHero({ onSignUp, onExplore }: LandingHeroProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 text-center">
      {/* Subtle Background Glow Spheres */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-[600px] h-[350px] bg-accent/10 blur-[130px] rounded-full -z-10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/3 top-20 w-[300px] h-[200px] bg-indigo-500/10 blur-[100px] rounded-full -z-10"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
        {/* Core Philosophy Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-edge/80 bg-surface/80 px-3.5 py-1.5 text-xs text-zinc-300 shadow-inner backdrop-blur-md">
          <Sparkles size={13} className="text-accent flex-shrink-0" />
          <span className="font-medium text-zinc-200">
            Hours don’t guarantee mastery. They make your investment visible.
          </span>
        </div>

        {/* Main Headline */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-balance text-zinc-50 leading-[1.1]">
            Become good at something.{' '}
            <span className="block bg-gradient-to-r from-zinc-100 via-accent to-indigo-400 bg-clip-text text-transparent">
              One hour at a time.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg md:text-xl text-zinc-400 text-balance leading-relaxed font-normal">
            Mastery turns deliberate practice into measurable, visually rewarding progress toward the skills and ambitions you care about.
          </p>
        </div>

        {/* Hero Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={onSignUp}
            className="w-full sm:w-auto text-base px-8 h-12 shadow-xl shadow-accent/25 hover:shadow-accent/40 font-semibold group gap-2"
          >
            <span>Start your journey</span>
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={onExplore}
            className="w-full sm:w-auto text-base px-6 h-12 gap-2 text-zinc-300 hover:text-white"
          >
            <Play size={15} className="text-accent fill-accent/20" />
            <span>See how it works</span>
          </Button>
        </div>

        {/* Value Anchors */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-zinc-500 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Timestamp-accurate focus tracking</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-accent text-sm">✦</span>
            <span>Meaningful milestone celebrations</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-warning text-sm">🔥</span>
            <span>Deliberate daily momentum</span>
          </div>
        </div>
      </div>
    </section>
  );
}
