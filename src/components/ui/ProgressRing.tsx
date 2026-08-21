import { cn } from '../../lib/utils';

interface ProgressRingProps {
  /** Progress percentage 0-100 */
  percentage: number;
  /** Ring diameter in pixels */
  size?: number;
  /** Stroke width relative to viewBox (default 8) */
  strokeWidth?: number;
  /** Accent color (CSS value) */
  color?: string;
  /** Content to show in the center */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function ProgressRing({
  percentage,
  size = 120,
  strokeWidth = 7,
  color = 'var(--color-accent)',
  children,
  className,
}: ProgressRingProps) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const clampedPct = Math.min(Math.max(percentage, 0), 100);
  const offset = circumference * (1 - clampedPct / 100);

  return (
    <div
      className={cn('relative inline-flex', className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(clampedPct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full -rotate-90"
        aria-hidden="true"
      >
        {/* Background track */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="var(--color-elevated)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      {/* Center content */}
      {children ? (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      ) : null}
    </div>
  );
}
