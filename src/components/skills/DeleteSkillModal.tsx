import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteSkillModalProps {
  open: boolean;
  skillName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteSkillModal({
  open,
  skillName,
  onClose,
  onConfirm,
}: DeleteSkillModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Delete "${skillName}"?`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4 pt-1">
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300">
          <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs leading-relaxed">
            <p className="font-semibold text-zinc-100">
              This action cannot be undone.
            </p>
            <p className="text-zinc-400">
              This will permanently remove <strong className="text-zinc-200">"{skillName}"</strong> and all of its recorded practice sessions, deliberate practice hours, and milestone achievements from your cosmos.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-edge/40">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onClose}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="bg-red-600 hover:bg-red-500 text-white font-bold gap-1.5 shadow-[0_0_16px_rgba(239,68,68,0.4)] cursor-pointer"
          >
            <Trash2 size={15} />
            <span>Delete Skill</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
