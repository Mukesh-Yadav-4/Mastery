import { cn } from '../../lib/utils';

interface CentralPresenceProps {
  className?: string;
  isHovered?: boolean;
}

export function CentralPresence({ className, isHovered }: CentralPresenceProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center select-none pointer-events-none',
        className,
      )}
    >
      {/* ── Floor Ripple Rings (Tilted 3D Elliptical Base) ───── */}
      <div className="absolute -bottom-6 w-56 sm:w-64 h-32 flex items-center justify-center -z-10 [perspective:600px]">
        <div className="relative w-full h-full [transform:rotateX(68deg)] flex items-center justify-center">
          {/* Outer Ripple Ring */}
          <div className="absolute inset-0 rounded-full border border-cyan-500/25 animate-pulse-slow shadow-[0_0_24px_rgba(34,211,238,0.2)]" />

          {/* Mid Energy Ring */}
          <div className="absolute inset-4 rounded-full border border-indigo-400/40 shadow-[0_0_18px_rgba(129,140,248,0.3)]" />

          {/* Inner Pedestal Ring */}
          <div className="absolute inset-10 rounded-full border border-accent/60 bg-gradient-to-r from-accent/20 via-cyan-500/20 to-accent/20 shadow-[0_0_20px_rgba(129,140,248,0.5)]" />

          {/* Central Radial Light Spot */}
          <div className="absolute w-20 h-20 rounded-full bg-cyan-400/30 blur-md" />
        </div>
      </div>

      {/* ── Luminous Human Silhouette ─────────────────────────── */}
      <div className="relative flex flex-col items-center">
        {/* Ambient Backlight Bloom */}
        <div
          className={cn(
            'absolute -top-4 w-28 h-44 rounded-full bg-gradient-to-b from-cyan-400/30 via-indigo-500/35 to-transparent blur-xl transition-all duration-700 -z-10',
            isHovered ? 'opacity-90 scale-110' : 'opacity-70',
          )}
          aria-hidden="true"
        />

        {/* Abstract Holographic Human Figure Vector */}
        <svg
          viewBox="0 0 100 200"
          className={cn(
            'w-20 h-40 sm:w-24 sm:h-48 transition-all duration-500 ease-out',
            'drop-shadow-[0_0_14px_rgba(129,140,248,0.85)] drop-shadow-[0_0_28px_rgba(34,211,238,0.45)]',
          )}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Luminous Body Gradient */}
            <linearGradient id="bodyGlow" x1="50" y1="10" x2="50" y2="190" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="25%" stopColor="#a5b4fc" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#818cf8" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.85" />
            </linearGradient>

            {/* Aura Energy Glow */}
            <radialGradient id="headAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#a5b4fc" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Halo / Head Ring */}
          <circle cx="50" cy="24" r="14" stroke="url(#bodyGlow)" strokeWidth="1.5" strokeDasharray="3 3" className="animate-spin-slow opacity-60" />

          {/* Head */}
          <circle cx="50" cy="24" r="9.5" fill="url(#bodyGlow)" />
          <circle cx="50" cy="24" r="5" fill="#ffffff" opacity="0.85" />

          {/* Torso & Core */}
          <path
            d="M50 36 C42 42, 38 52, 38 68 C38 88, 43 102, 45 115 L55 115 C57 102, 62 88, 62 68 C62 52, 58 42, 50 36 Z"
            fill="url(#bodyGlow)"
            opacity="0.88"
          />

          {/* Spine / Energy Column */}
          <line x1="50" y1="36" x2="50" y2="115" stroke="#ffffff" strokeWidth="1.8" opacity="0.8" />
          <circle cx="50" cy="50" r="2" fill="#ffffff" />
          <circle cx="50" cy="72" r="2.5" fill="#ffffff" />
          <circle cx="50" cy="94" r="2" fill="#ffffff" />

          {/* Arms / Radiant Contours */}
          <path
            d="M38 46 C30 55, 26 72, 24 95 C23 105, 22 115, 23 125"
            stroke="url(#bodyGlow)"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.75"
          />
          <path
            d="M62 46 C70 55, 74 72, 76 95 C77 105, 78 115, 77 125"
            stroke="url(#bodyGlow)"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.75"
          />

          {/* Legs */}
          {/* Left Leg */}
          <path
            d="M45 115 C44 130, 42 152, 40 175 L38 190"
            stroke="url(#bodyGlow)"
            strokeWidth="4.5"
            strokeLinecap="round"
            opacity="0.85"
          />
          {/* Right Leg */}
          <path
            d="M55 115 C56 130, 58 152, 60 175 L62 190"
            stroke="url(#bodyGlow)"
            strokeWidth="4.5"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Base Light Contact Points */}
          <ellipse cx="38" cy="190" rx="4" ry="1.5" fill="#22d3ee" />
          <ellipse cx="62" cy="190" rx="4" ry="1.5" fill="#22d3ee" />
        </svg>

        {/* ── "YOU" Origin Beacon ────────────────────────────── */}
        <div className="mt-1 pointer-events-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-surface/90 border border-accent/60 shadow-[0_0_14px_rgba(129,140,248,0.4)] backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[10px] font-black tracking-widest uppercase text-zinc-100">
              YOU
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
