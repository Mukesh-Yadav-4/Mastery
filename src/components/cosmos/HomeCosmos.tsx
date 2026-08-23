import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Cosmos3DScene, type SceneNodeData } from './Cosmos3DScene';
import { CosmicHUD } from './CosmicHUD';
import { formatDuration } from '../../utils/calculations';
import { getSkillProgressionState } from '../../utils/progression';
import type { CosmicNodeData } from './CosmicNode';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export function HomeCosmos({ onOpenCreateSkill }: { onOpenCreateSkill: () => void }) {
  const {
    skillProgress,
    totalSeconds,
    streak,
    totalXP,
    globalLevelInfo,
    corePalette,
    startTimer,
  } = useApp();

  // Map ONLY real active user skills into 3D scene node data with progression profiles
  const sceneNodes: SceneNodeData[] = useMemo(() => {
    return skillProgress.map((sp) => {
      const progression = getSkillProgressionState(
        sp.skill.id,
        sp.skill.name,
        sp.totalSeconds,
        sp.skillLevel.level,
      );

      return {
        id: sp.skill.id,
        name: sp.skill.name,
        icon: sp.skill.icon,
        color: sp.skill.color,
        level: sp.skillLevel.level,
        xp: sp.skillXP,
        totalHours: sp.totalHours,
        formattedDuration: formatDuration(sp.totalSeconds),
        targetHours: sp.skill.targetHours,
        percentage: sp.percentage,
        progression,
      };
    });
  }, [skillProgress]);

  // Selected node state
  const [selectedNodeId, setSelectedNodeId] = useState<string>(() => {
    return sceneNodes[0]?.id ?? '';
  });

  // Keep selection synchronized with real skills list
  const activeSelectedId = sceneNodes.some((n) => n.id === selectedNodeId)
    ? selectedNodeId
    : sceneNodes[0]?.id ?? '';

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

  const handleStartFocus = (skillId: string) => {
    if (!skillId) {
      onOpenCreateSkill();
      return;
    }
    startTimer(skillId);
  };

  const hasSkills = sceneNodes.length > 0;

  return (
    <section className="relative w-full rounded-3xl overflow-hidden bg-[#060813] border border-edge/60 shadow-2xl shadow-black/90 transition-all">
      {/* ── Ambient Radial Atmosphere Highlights ─────────────── */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-indigo-950/40 blur-[130px] opacity-70" />
        <div className="absolute bottom-10 right-10 w-[350px] h-[350px] rounded-full bg-cyan-950/25 blur-[110px] opacity-50" />
      </div>

      {/* ── 3D WebGL Cosmic Growth Scene ───────────────────────── */}
      <div className="relative w-full h-[520px] sm:h-[620px] lg:h-[680px]">
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
        />

        {/* Zero-Skill Empty State Prompt Overlay */}
        {!hasSkills && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
            <div className="max-w-md space-y-3 bg-surface/70 border border-edge/60 p-6 rounded-3xl backdrop-blur-md shadow-2xl pointer-events-auto">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent shadow-[0_0_16px_rgba(129,140,248,0.4)]">
                <Sparkles size={22} />
              </div>
              <h3 className="text-lg font-bold text-zinc-100">
                Your cosmos begins with a skill
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Add a deliberate practice skill to ignite your personal growth constellation. Every hour of focused investment visibly shapes your universe.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={onOpenCreateSkill}
                className="w-full font-bold gap-2 shadow-[0_0_18px_rgba(129,140,248,0.4)]"
              >
                <Plus size={16} />
                <span>Create Your First Skill</span>
              </Button>
            </div>
          </div>
        )}

        {/* 3D WebGL Canvas Viewport */}
        <Cosmos3DScene
          nodes={sceneNodes}
          selectedNodeId={activeSelectedId}
          onSelectNode={(node) => setSelectedNodeId(node.id)}
          globalLevel={globalLevelInfo.level}
          palette={corePalette}
          className="w-full h-full"
        />
      </div>
    </section>
  );
}
