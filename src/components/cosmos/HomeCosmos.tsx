import { useState, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Cosmos3DScene, type SceneNodeData } from './Cosmos3DScene';
import { CosmicHUD } from './CosmicHUD';
import { SkillJourneyPanel } from './SkillJourneyPanel';
import { SkillNodePreview } from './SkillNodePreview';
import { CosmicFeedbackOverlay } from './CosmicFeedbackOverlay';
import { formatDuration } from '../../utils/calculations';
import { getSkillProgressionState } from '../../utils/progression';
import type { CosmicNodeData } from './CosmicNode';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { CosmicDevTools } from '../dev/CosmicDevTools';

export function HomeCosmos({ onOpenCreateSkill }: { onOpenCreateSkill: () => void }) {
  const {
    skillProgress,
    totalSeconds,
    streak,
    totalXP,
    globalLevelInfo,
    corePalette,
    startTimer,
    activeFeedbackEvent,
    dismissFeedback,
  } = useApp();

  const [feedbackPhase, setFeedbackPhase] = useState<
    'idle' | 'focus' | 'core_charge' | 'transfer' | 'absorption' | 'reveal' | 'settled'
  >('idle');

  // Map ONLY real active user skills into 3D scene node data with progression profiles
  const sceneNodes: SceneNodeData[] = useMemo(() => {
    return skillProgress.map((sp) => {
      // If there's an active feedback event for this skill, hold at pre-completion state until user presses Continue
      const isTargetOfFeedback =
        activeFeedbackEvent && activeFeedbackEvent.skillId === sp.skill.id;
      const effectiveSeconds = isTargetOfFeedback
        ? activeFeedbackEvent.previousSeconds
        : sp.totalSeconds;
      const effectiveLevel = isTargetOfFeedback
        ? activeFeedbackEvent.previousSkillLevel.level
        : sp.skillLevel.level;

      const progression = getSkillProgressionState(
        sp.skill.id,
        sp.skill.name,
        effectiveSeconds,
        effectiveLevel,
        sp.skill.category,
        sp.skill.targetHours,
        sp.skill.color,
      );

      return {
        id: sp.skill.id,
        name: sp.skill.name,
        icon: sp.skill.icon,
        color: sp.skill.color,
        level: effectiveLevel,
        xp: isTargetOfFeedback
          ? sp.skillXP - activeFeedbackEvent.xpEarned
          : sp.skillXP,
        totalHours: effectiveSeconds / 3600,
        formattedDuration: formatDuration(effectiveSeconds),
        targetHours: sp.skill.targetHours,
        percentage:
          sp.skill.targetHours > 0
            ? Math.min(
                100,
                (effectiveSeconds / (sp.skill.targetHours * 3600)) * 100,
              )
            : 0,
        progression,
      };
    });
  }, [skillProgress, activeFeedbackEvent]);

  // Selected node state
  const [selectedNodeId, setSelectedNodeId] = useState<string>(() => {
    return sceneNodes[0]?.id ?? '';
  });

  // Hovered node state for lightweight preview
  const [hoveredNode, setHoveredNode] = useState<SceneNodeData | null>(null);

  // Skill Journey deep interpretation panel open state
  const [isJourneyOpen, setIsJourneyOpen] = useState(false);

  // Keep selection synchronized with real skills list (or active feedback event)
  const activeSelectedId = activeFeedbackEvent
    ? activeFeedbackEvent.skillId
    : sceneNodes.some((n) => n.id === selectedNodeId)
    ? selectedNodeId
    : sceneNodes[0]?.id ?? '';

  const effectiveJourneyOpen = isJourneyOpen && !activeFeedbackEvent;

  const selectedNode = useMemo(() => {
    const found = sceneNodes.find((n) => n.id === activeSelectedId) || sceneNodes[0] || null;
    if (!found) return null;

    const hudNode: CosmicNodeData = {
      ...found,
      depth: 'foreground',
      x: 50,
      y: 50,
      progression: found.progression,
    };
    return hudNode;
  }, [sceneNodes, activeSelectedId]);

  const handleSelectNode = useCallback(
    (node: SceneNodeData) => {
      if (selectedNodeId === node.id && isJourneyOpen) {
        setIsJourneyOpen(false);
      } else {
        setSelectedNodeId(node.id);
        setIsJourneyOpen(true);
      }
    },
    [selectedNodeId, isJourneyOpen],
  );

  const handleStartFocus = (skillId: string) => {
    if (!skillId) {
      onOpenCreateSkill();
      return;
    }
    setIsJourneyOpen(false);
    startTimer(skillId);
  };

  const hasSkills = sceneNodes.length > 0;

  return (
    <section className="relative w-full h-full overflow-hidden bg-[#060813] select-none">
      {/* ── Ambient Radial Atmosphere Highlights ─────────────── */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-indigo-950/40 blur-[140px] opacity-70" />
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] rounded-full bg-cyan-950/25 blur-[120px] opacity-50" />
      </div>

      {/* ── 3D WebGL Cosmic Growth Scene Viewport (True Fullscreen Canvas) ── */}
      <div className="relative w-full h-full">
        {/* Floating Holographic HUD */}
        <CosmicHUD
          levelInfo={globalLevelInfo}
          totalXP={totalXP}
          totalDurationFormatted={formatDuration(totalSeconds)}
          streakDays={streak.currentStreak}
          selectedNode={selectedNode}
          palette={corePalette}
          onStartFocus={handleStartFocus}
          onOpenCreateSkill={onOpenCreateSkill}
          onOpenJourney={() => setIsJourneyOpen(true)}
        />

        {/* Hover Node Contextual Preview */}
        {!effectiveJourneyOpen && hoveredNode && !activeFeedbackEvent && (
          <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
            <SkillNodePreview node={hoveredNode} />
          </div>
        )}

        {/* Interactive Full Skill Journey Panel (Floating Overlay) */}
        {effectiveJourneyOpen && selectedNode && (
          <SkillJourneyPanel
            node={selectedNode}
            onClose={() => setIsJourneyOpen(false)}
            onStartFocus={handleStartFocus}
          />
        )}

        {/* Cinematic Feedback Reward Overlay (Appears on Reveal/Settled phase) */}
        {activeFeedbackEvent &&
          (feedbackPhase === 'reveal' || feedbackPhase === 'settled') && (
            <CosmicFeedbackOverlay
              event={activeFeedbackEvent}
              onDismiss={dismissFeedback}
            />
          )}

        {/* Zero-Skill Empty State Prompt Overlay */}
        {!hasSkills && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
            <div className="max-w-xs space-y-2.5 bg-surface/85 border border-edge/80 p-5 rounded-3xl backdrop-blur-xl shadow-2xl pointer-events-auto">
              <div className="w-10 h-10 mx-auto rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shadow-[0_0_14px_rgba(129,140,248,0.35)]">
                <Sparkles size={18} />
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-accent block">
                  Begin Your Universe
                </span>
                <h3 className="text-sm font-bold text-zinc-100">
                  Add your first skill
                </h3>
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Every hour of deliberate practice visibly expands your personal cosmic network.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={onOpenCreateSkill}
                className="w-full font-bold gap-1.5 py-2 text-xs shadow-[0_0_16px_rgba(129,140,248,0.4)] cursor-pointer h-8.5"
              >
                <Plus size={14} />
                <span>Add Skill</span>
              </Button>
            </div>
          </div>
        )}

        {/* 3D WebGL Canvas Viewport */}
        <Cosmos3DScene
          nodes={sceneNodes}
          selectedNodeId={activeSelectedId}
          onSelectNode={handleSelectNode}
          onHoverNode={setHoveredNode}
          globalLevel={globalLevelInfo.level}
          palette={corePalette}
          feedbackEvent={activeFeedbackEvent}
          onFeedbackPhaseChange={setFeedbackPhase}
          className="w-full h-full"
        />

        {/* Development-Only Cinematic Preview & Simulation Tooling */}
        <CosmicDevTools />
      </div>
    </section>
  );
}
