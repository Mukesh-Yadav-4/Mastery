import { useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';
import { formatDuration } from '../../utils/calculations';
import { Sparkles, Download, Copy, Check, Flame } from 'lucide-react';

interface ShareProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareProgressModal({
  isOpen,
  onClose,
}: ShareProgressModalProps) {
  const {
    totalXP,
    globalLevelInfo,
    totalSeconds,
    streak,
    skillProgress,
    corePalette,
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const topSkills = [...skillProgress]
    .sort((a, b) => b.totalSeconds - a.totalSeconds)
    .slice(0, 3);

  // Render to canvas and export image
  const generateCanvas = async (): Promise<HTMLCanvasElement | null> => {
    const cardEl = cardRef.current;
    if (!cardEl) return null;

    const width = 800;
    const height = 450;
    const canvas = document.createElement('canvas');
    canvas.width = width * 2; // retina 2x
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.scale(2, 2);

    // 1. Dark Cosmic Void Background
    const bgGradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      50,
      width / 2,
      height / 2,
      width / 1.4,
    );
    bgGradient.addColorStop(0, '#0c1024');
    bgGradient.addColorStop(0.6, '#060813');
    bgGradient.addColorStop(1, '#020308');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Glowing Core Nebula Aura
    const auraGradient = ctx.createRadialGradient(
      width / 2,
      height / 2.3,
      10,
      width / 2,
      height / 2.3,
      180,
    );
    auraGradient.addColorStop(0, `${corePalette.aura}60`);
    auraGradient.addColorStop(0.5, `${corePalette.corePrimary}25`);
    auraGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = auraGradient;
    ctx.fillRect(0, 0, width, height);

    // 3. Star Dust Flecks
    ctx.fillStyle = '#ffffff';
    const stars = [
      [120, 80, 1.2],
      [240, 140, 1.8],
      [700, 90, 1.5],
      [650, 320, 1.2],
      [140, 360, 1.6],
      [730, 240, 2.0],
      [380, 60, 1.0],
      [520, 70, 1.3],
    ];
    stars.forEach(([x, y, r]) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.globalAlpha = 0.6;
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // 4. Subtle Concentric Orbital Rings
    ctx.strokeStyle = `${corePalette.accent}30`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(width / 2, height / 2.3, 140, 55, Math.PI / 6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = `${corePalette.aura}20`;
    ctx.beginPath();
    ctx.ellipse(width / 2, height / 2.3, 190, 75, -Math.PI / 7, 0, Math.PI * 2);
    ctx.stroke();

    // 5. Central Glowing Mastery Core Sphere
    const coreGrad = ctx.createRadialGradient(
      width / 2 - 12,
      height / 2.3 - 12,
      4,
      width / 2,
      height / 2.3,
      44,
    );
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.3, corePalette.coreInner);
    coreGrad.addColorStop(0.7, corePalette.corePrimary);
    coreGrad.addColorStop(1, corePalette.coreSecondary);

    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2.3, 40, 0, Math.PI * 2);
    ctx.fill();

    // Core Outer Border Ring
    ctx.strokeStyle = '#ffffff80';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 6. Header Branding: Mastery
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
    ctx.fillText('⚡ MASTERY', 40, 52);

    ctx.fillStyle = '#818cf8';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText('DELIBERATE PRACTICE COSMOS', 40, 70);

    // 7. Mastery Level & Title (Bottom of Core)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Level ${globalLevelInfo.level}`, width / 2, 260);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 13px system-ui, -apple-system, sans-serif';
    ctx.fillText('Cosmic Progression State', width / 2, 280);

    // 8. Stats Footer Pill Grid
    ctx.textAlign = 'left';
    const drawStatPill = (
      x: number,
      y: number,
      w: number,
      label: string,
      val: string,
      icon: string,
    ) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x, y, w, 68, 16);
      ctx.fill();
      ctx.stroke();

      ctx.font = '16px system-ui, sans-serif';
      ctx.fillText(icon, x + 16, y + 32);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.fillText(label.toUpperCase(), x + 44, y + 28);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.fillText(val, x + 44, y + 50);
    };

    const pillW = 210;
    const startX = 65;
    const pillY = 330;
    drawStatPill(
      startX,
      pillY,
      pillW,
      'Practice Time',
      formatDuration(totalSeconds),
      '⏱️',
    );
    drawStatPill(
      startX + pillW + 20,
      pillY,
      pillW,
      'Mastery XP',
      `${totalXP.toLocaleString()} XP`,
      '✨',
    );
    drawStatPill(
      startX + (pillW + 20) * 2,
      pillY,
      pillW,
      'Active Streak',
      `${streak.currentStreak} Days`,
      '🔥',
    );

    // Top Right Watermark
    ctx.textAlign = 'right';
    ctx.fillStyle = '#64748b';
    ctx.font = '500 11px system-ui, sans-serif';
    ctx.fillText(
      new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      width - 40,
      52,
    );

    return canvas;
  };

  const handleCopy = async () => {
    setIsExporting(true);
    try {
      const canvas = await generateCanvas();
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        } catch {
          // Fallback download if clipboard item is restricted
          handleDownload();
        }
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const canvas = await generateCanvas();
      if (!canvas) return;

      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `mastery-level-${globalLevelInfo.level}-journey.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Share Your Mastery Cosmos"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 animate-fade-in">
        {/* ── Visual Card Preview ── */}
        <div
          ref={cardRef}
          className="relative rounded-3xl overflow-hidden border border-edge/80 p-6 sm:p-8 bg-[#070a16] shadow-2xl space-y-6"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 40%, ${corePalette.aura}30 0%, transparent 65%)`,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  MASTERY
                </h3>
                <p className="text-[10px] text-accent font-semibold tracking-wider uppercase">
                  Deliberate Practice Cosmos
                </p>
              </div>
            </div>

            <span className="text-xs text-zinc-500 font-medium">
              {new Date().toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          {/* Glowing Centerpiece Core */}
          <div className="text-center space-y-3 py-2">
            <div className="relative inline-flex items-center justify-center">
              {/* Outer Core Aura */}
              <div
                className="w-20 h-20 rounded-full blur-xl opacity-80 absolute"
                style={{ backgroundColor: corePalette.corePrimary }}
              />
              {/* Core Sphere */}
              <div
                className="w-16 h-16 rounded-full border border-white/60 relative flex items-center justify-center shadow-2xl overflow-hidden"
                style={{
                  background: `radial-gradient(circle at 35% 35%, #ffffff, ${corePalette.coreInner} 35%, ${corePalette.corePrimary} 70%, ${corePalette.coreSecondary} 100%)`,
                }}
              >
                <div className="w-5 h-5 rounded-full bg-white/70 blur-[1px]" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Level {globalLevelInfo.level}
              </h2>
              <p className="text-xs text-zinc-400 font-medium">
                Cosmic Progression State
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3 text-center space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                Total Practice
              </span>
              <span className="text-sm font-bold text-zinc-100 tabular-nums">
                {formatDuration(totalSeconds)}
              </span>
            </div>

            <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3 text-center space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block flex items-center justify-center gap-1">
                <Sparkles size={11} className="text-accent" />
                Mastery XP
              </span>
              <span className="text-sm font-bold text-zinc-100 tabular-nums">
                {totalXP.toLocaleString()} XP
              </span>
            </div>

            <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3 text-center space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block flex items-center justify-center gap-1">
                <Flame size={11} className="text-orange-400" />
                Streak
              </span>
              <span className="text-sm font-bold text-zinc-100 tabular-nums">
                {streak.currentStreak} Days
              </span>
            </div>
          </div>

          {/* Top Skills Preview */}
          {topSkills.length > 0 && (
            <div className="flex items-center justify-center gap-2 pt-1">
              {topSkills.map((sp) => (
                <div
                  key={sp.skill.id}
                  className="px-2.5 py-1 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-medium text-zinc-300 flex items-center gap-1.5"
                >
                  <span>{sp.skill.icon}</span>
                  <span className="text-[11px] truncate max-w-[100px]">
                    {sp.skill.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-zinc-400">
            Share your deliberate practice growth with your friends or network.
          </p>

          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              disabled={isExporting}
              className="flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">
                    Copied to Clipboard!
                  </span>
                </>
              ) : (
                <>
                  <Copy size={14} className="text-accent" />
                  <span>Copy Image</span>
                </>
              )}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleDownload}
              disabled={isExporting}
              className="flex items-center gap-1.5 shadow-lg shadow-accent/20"
            >
              <Download size={14} />
              <span>Download PNG</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
