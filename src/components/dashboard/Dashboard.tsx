import { useState } from 'react';
import { HomeCosmos } from '../cosmos/HomeCosmos';
import { CreateSkillModal } from '../skills/CreateSkillModal';

export function Dashboard() {
  const [showCreateSkill, setShowCreateSkill] = useState(false);

  return (
    <div className="w-full h-full relative overflow-hidden animate-fade-in select-none">
      {/* ── Fullscreen 3D Cosmic Universe ── */}
      <HomeCosmos onOpenCreateSkill={() => setShowCreateSkill(true)} />

      {/* Create Skill Modal */}
      <CreateSkillModal
        open={showCreateSkill}
        onClose={() => setShowCreateSkill(false)}
      />
    </div>
  );
}
