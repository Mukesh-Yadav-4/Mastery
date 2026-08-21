import { Button } from '../ui/Button';
import { ArrowRight, Sparkles } from 'lucide-react';

interface PhilosophySectionsProps {
  onSignUp: () => void;
}

export function PhilosophySections({ onSignUp }: PhilosophySectionsProps) {
  return (
    <div className="space-y-24 md:space-y-36 py-12">
      {/* ── SECTION 4: THE PROBLEM ────────────────────────────────────────── */}
      <section id="philosophy" className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="rounded-2xl border border-edge/60 bg-gradient-to-b from-surface/80 to-canvas p-8 sm:p-12">
          <div className="max-w-3xl space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-accent">
              The Fundamental Problem
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-50 leading-tight">
              We live in systems designed to measure your consumption.
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
              Likes, views, notifications, and algorithmic feeds keep track of how much attention you surrender to other people’s creations. But when you set out to learn a language, write a book, play an instrument, or build complex software — <span className="text-zinc-200 font-medium">your effort is silent and invisible.</span>
            </p>
            <div className="pt-2 border-t border-edge/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-canvas/60 border border-edge/40 space-y-1.5">
                <p className="text-xs font-bold text-red-400 uppercase tracking-wider">The Modern Default</p>
                <p className="text-sm text-zinc-300">Vague ambitions with zero measurement, quickly abandoned when motivation fades.</p>
              </div>
              <div className="p-4 rounded-xl bg-accent/10 border border-accent/30 space-y-1.5">
                <p className="text-xs font-bold text-accent uppercase tracking-wider">The Mastery Approach</p>
                <p className="text-sm text-zinc-200">Quantified, deliberate practice that turns invisible effort into motivating, compounding reality.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5 & 6: HOW IT WORKS (THE CORE LOOP) ──────────────────── */}
      <section id="how-it-works" className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            The Deliberate Practice Engine
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-50">
            How Mastery Works
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            A simple, repeatable cycle engineered around high-agency deliberate focus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="relative rounded-xl border border-edge/60 bg-surface/60 p-6 space-y-4 hover:border-edge transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent font-bold text-lg">
              1
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <span>Choose & Commit</span>
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Choose what skill you want to master. Set a clear target commitment (e.g. 50 hours, 100 hours, 500 hours).
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative rounded-xl border border-edge/60 bg-surface/60 p-6 space-y-4 hover:border-edge transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent font-bold text-lg">
              2
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <span>Focused Practice</span>
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Enter an immersive, distraction-free focus mode. Timestamp tracking ensures no false or inflated practice time.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative rounded-xl border border-edge/60 bg-surface/60 p-6 space-y-4 hover:border-edge transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent font-bold text-lg">
              3
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <span>Unlock Milestones</span>
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Watch your investment accumulate. Cross 10%, 25%, 50%, 75%, and 100% milestone thresholds and protect your daily streak.
              </p>
            </div>
          </div>
        </div>

        {/* Accumulation Ladder Visual */}
        <div className="mt-12 rounded-xl border border-edge/50 bg-canvas/70 p-6 text-center space-y-4">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            The Accumulation Ladder
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-lg bg-elevated text-zinc-400">30 mins</span>
            <span className="text-zinc-600">→</span>
            <span className="px-3 py-1.5 rounded-lg bg-elevated text-zinc-300">1 hour</span>
            <span className="text-zinc-600">→</span>
            <span className="px-3 py-1.5 rounded-lg bg-elevated text-zinc-200">10 hours</span>
            <span className="text-zinc-600">→</span>
            <span className="px-3 py-1.5 rounded-lg bg-accent/15 text-accent border border-accent/30 font-bold">25 hours</span>
            <span className="text-zinc-600">→</span>
            <span className="px-3 py-1.5 rounded-lg bg-accent/20 text-accent border border-accent/40 font-bold">50 hours</span>
            <span className="text-zinc-600">→</span>
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">100 hours</span>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: WHY SMALL SESSIONS MATTER (CONSISTENCY) ──────────── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center rounded-2xl border border-edge/60 bg-surface/50 p-8 sm:p-12">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-accent">
              The Math of Consistency
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-50 leading-tight">
              Small sessions compound into extraordinary depth.
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              30 minutes of deliberate practice feels small on any single day. But 30 minutes repeated 5 days a week becomes <span className="text-zinc-200 font-semibold">130 hours</span> of deep focus in a year.
            </p>
            <p className="text-sm text-zinc-400">
              Mastery removes the pressure of marathon sessions and rewards the compounding habit of showing up.
            </p>
          </div>

          {/* Consistency Card Graphic */}
          <div className="rounded-xl border border-edge/80 bg-canvas/90 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-edge/60 pb-3">
              <span className="text-xs font-bold text-zinc-300">Annual Compounding</span>
              <span className="text-xs text-orange-400 font-semibold flex items-center gap-1">
                🔥 5 Days / Week
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-zinc-400">30 min / day</span>
                <span className="font-mono font-bold text-zinc-200 text-sm">130 Hours / Year</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-zinc-400">45 min / day</span>
                <span className="font-mono font-bold text-accent text-sm">195 Hours / Year</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-zinc-400">60 min / day</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">260 Hours / Year</span>
              </div>
            </div>

            <div className="pt-2 border-t border-edge/40 text-[11px] text-zinc-500 italic">
              "Effort compounds quietly until the breakthrough is undeniable."
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 8: DISCIPLINES & USE CASES ────────────────────────────── */}
      <section id="disciplines" className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            Broad Flexibility
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-50">
            For Any Learnable Discipline
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            Whether technical, artistic, intellectual, or athletic — if deliberate practice makes you better, Mastery tracks it.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[
            { name: 'Languages', example: 'German, Spanish', icon: '🗣️' },
            { name: 'Programming', example: 'Python, Rust', icon: '💻' },
            { name: 'Music', example: 'Piano, Guitar', icon: '🎹' },
            { name: 'Thinking', example: 'Writing, Chess', icon: '✍️' },
            { name: 'Creative', example: 'Drawing, 3D Art', icon: '🎨' },
            { name: 'Craft', example: 'CAD, Systems', icon: '📐' },
          ].map((d) => (
            <div
              key={d.name}
              className="rounded-xl border border-edge/60 bg-surface/40 p-4 text-center space-y-1.5 hover:border-edge hover:bg-surface/80 transition-all"
            >
              <div className="text-2xl mb-1">{d.icon}</div>
              <h3 className="text-sm font-bold text-zinc-100">{d.name}</h3>
              <p className="text-[11px] text-zinc-500 truncate">{d.example}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 9: THE 100-HOUR PRINCIPLE ─────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/10 via-surface/60 to-canvas p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-1.5">
              <Sparkles size={14} />
              The 100-Hour Commitment
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-50">
              You don’t need 10,000 hours to begin.
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              100 hours of focused, deliberate practice puts you ahead of 95% of casual dabblers. It is long enough to overcome the frustrating beginner barrier and build genuine, lasting capability.
            </p>
            <p className="text-xs sm:text-sm text-zinc-400">
              Pick a craft. Set 100 hours as your target. Watch what happens.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 10: FINAL CALL TO ACTION ──────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center space-y-8 pt-8">
        <div className="space-y-4">
          <div className="text-4xl">⚡</div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-50">
            What do you want to become good at?
          </h2>
          <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto">
            Stop leaving your ambitions to vague intentions. Make your effort measurable, visible, and rewarding today.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="primary"
            size="lg"
            onClick={onSignUp}
            className="w-full sm:w-auto text-base px-10 h-13 shadow-xl shadow-accent/30 hover:shadow-accent/50 font-bold gap-2 text-white"
          >
            <span>Start your journey</span>
            <ArrowRight size={18} />
          </Button>
        </div>

        <p className="text-xs text-zinc-500">
          Free to use • Local and private • No intrusive notifications
        </p>

        {/* Minimal Footer */}
        <footer className="pt-16 border-t border-edge/40 text-xs text-zinc-600 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 font-semibold">Mastery</span>
            <span>•</span>
            <span>Deliberate Practice Tracker</span>
          </div>
          <div>
            <span>Hours don't guarantee mastery. They make your investment visible.</span>
          </div>
        </footer>
      </section>
    </div>
  );
}
