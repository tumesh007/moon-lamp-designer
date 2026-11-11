import React from 'react';
import { Moon, FolderOpen, Printer, FileText, RotateCcw, Sparkles } from 'lucide-react';

interface HeaderProps {
  projectName: string;
  onOpenSaveLoad: () => void;
  onOpenSlicing: () => void;
  onOpenBom: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  projectName,
  onOpenSaveLoad,
  onOpenSlicing,
  onOpenBom,
  onReset
}) => {
  return (
    <header className="h-14 bg-space-950/90 border-b border-space-800/80 px-4 flex items-center justify-between select-none z-30">
      {/* Brand & Project Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-lunar-gold flex items-center justify-center shadow-[0_0_15px_rgba(245,192,101,0.3)]">
            <Moon className="w-4 h-4 text-space-950 fill-space-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wider uppercase text-white font-mono">
                LUNARIS
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-space-850 text-lunar-gold border border-lunar-gold/30">
                A1 Mini Ready
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-sans leading-none">
              Custom 3D Moon Lamp Studio
            </div>
          </div>
        </div>

        <div className="hidden md:block w-px h-6 bg-space-800 mx-2" />

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-300">
          <span className="text-slate-500 font-mono">Project:</span>
          <span className="font-medium text-white">{projectName}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSaveLoad}
          className="px-3 py-1.5 bg-space-900 hover:bg-space-850 border border-space-700/80 rounded-xl text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
        >
          <FolderOpen className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Projects</span>
        </button>

        <button
          onClick={onOpenSlicing}
          className="px-3 py-1.5 bg-space-900 hover:bg-space-850 border border-space-700/80 rounded-xl text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
        >
          <Printer className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">A1 Slicing</span>
        </button>

        <button
          onClick={onOpenBom}
          className="px-3 py-1.5 bg-space-900 hover:bg-space-850 border border-space-700/80 rounded-xl text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">BOM</span>
        </button>

        <button
          onClick={onReset}
          title="Reset to default settings"
          className="p-1.5 hover:bg-space-850 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
