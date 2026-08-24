import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import {
  Download,
  Upload,
  Database,
  CheckCircle2,
  AlertCircle,
  FileJson,
  RefreshCw,
} from 'lucide-react';
import {
  generateBackupData,
  downloadBackupFile,
  parseAndValidateBackup,
  restoreBackupData,
  type MasteryBackupData,
} from '../../utils/backup';
import { soundEngine } from '../../utils/audio';

export function DataBackupSection() {
  const { user } = useAuth();
  const { refreshData } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });

  const [pendingBackup, setPendingBackup] = useState<MasteryBackupData | null>(
    null,
  );
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!user) return null;

  const handleExport = () => {
    try {
      const data = generateBackupData(user.id);
      downloadBackupFile(data);
      setImportStatus({
        type: 'success',
        message: `Exported ${data.skills.length} skills and ${data.sessions.length} focus sessions to JSON.`,
      });
    } catch {
      setImportStatus({
        type: 'error',
        message: 'Failed to generate backup export.',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus({ type: 'idle', message: '' });
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = parseAndValidateBackup(content);

      if (res.valid) {
        setPendingBackup(res.data);
      } else {
        setImportStatus({
          type: 'error',
          message: res.error,
        });
      }
    };

    reader.onerror = () => {
      setImportStatus({
        type: 'error',
        message: 'Could not read file from disk.',
      });
    };

    reader.readAsText(file);
    // Reset file input so same file can be re-selected if needed
    e.target.value = '';
  };

  const handleConfirmImport = () => {
    if (!pendingBackup) return;
    setIsProcessing(true);

    try {
      const stats = restoreBackupData(user.id, pendingBackup, importMode);
      refreshData();
      soundEngine.playFanfare();
      setImportStatus({
        type: 'success',
        message: `Successfully imported ${stats.importedSkills} skills and ${stats.importedSessions} sessions!`,
      });
      setPendingBackup(null);
    } catch (err) {
      setImportStatus({
        type: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'An error occurred during restore.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="rounded-card bg-surface border border-edge/30 p-5 space-y-4">
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-2">
          <Database size={14} />
          <span>Data Ownership & Backups</span>
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Your deliberate practice data is 100% private and stored locally. Export
          a complete JSON snapshot anytime or restore a previous backup.
        </p>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleExport}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Download size={14} className="text-accent" />
          <span>Export Data (JSON)</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 cursor-pointer border border-edge/60 hover:border-zinc-500"
        >
          <Upload size={14} className="text-cyan-400" />
          <span>Import / Restore Backup</span>
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* ── Pending Restore Confirmation Preview ── */}
      {pendingBackup && (
        <div className="rounded-2xl bg-canvas/90 border border-accent/40 p-4 space-y-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <FileJson size={18} className="text-accent" />
            <div>
              <h3 className="text-xs font-bold text-zinc-100">
                Backup File Ready to Restore
              </h3>
              <p className="text-[11px] text-zinc-400">
                Found {pendingBackup.skills.length} skills,{' '}
                {pendingBackup.sessions.length} sessions (Exported:{' '}
                {new Date(pendingBackup.exportedAt).toLocaleDateString()})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
              <input
                type="radio"
                name="importMode"
                value="merge"
                checked={importMode === 'merge'}
                onChange={() => setImportMode('merge')}
                className="accent-accent"
              />
              <span>Merge with existing</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
              <input
                type="radio"
                name="importMode"
                value="replace"
                checked={importMode === 'replace'}
                onChange={() => setImportMode('replace')}
                className="accent-accent"
              />
              <span>Replace current data</span>
            </label>
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmImport}
              disabled={isProcessing}
              className="flex items-center gap-1.5"
            >
              {isProcessing && <RefreshCw size={12} className="animate-spin" />}
              <span>Confirm & Restore</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPendingBackup(null)}
              className="text-zinc-500"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* ── Status Message Toast ── */}
      {importStatus.type !== 'idle' && (
        <div
          className={`flex items-center gap-2 text-xs p-3 rounded-xl border animate-fade-in ${
            importStatus.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {importStatus.type === 'success' ? (
            <CheckCircle2 size={15} className="flex-shrink-0" />
          ) : (
            <AlertCircle size={15} className="flex-shrink-0" />
          )}
          <span>{importStatus.message}</span>
        </div>
      )}
    </div>
  );
}
