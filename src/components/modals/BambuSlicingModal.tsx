import React from 'react';
import { X, Printer, CheckCircle, AlertTriangle, Copy, Check } from 'lucide-react';

interface SlicingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BambuSlicingModal: React.FC<SlicingModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const slicingSettings = [
    { label: 'Layer Height', val: '0.12 mm (High Detail) or 0.16 mm (Standard)' },
    { label: 'Initial Layer Height', val: '0.20 mm (for maximum bed adhesion)' },
    { label: 'Wall Loops (Perimeters)', val: '99 (or 100% Infill) — CRITICAL: Eliminates internal grid shadow' },
    { label: 'Sparse Infill Density', val: '100% (Solid Wall)' },
    { label: 'Sparse Infill Pattern', val: 'Concentric or Rectilinear' },
    { label: 'Outer Wall Speed', val: '40 - 50 mm/s (Slow speed preserves facial detail & avoids ringing)' },
    { label: 'Inner Wall Speed', val: '60 - 80 mm/s' },
    { label: 'Seam Position', val: 'Aligned (Positioned at rear of moon away from photo)' },
    { label: 'Print Bed Brim', val: 'Outer brim only, 5 mm width (Prevents spherical lift/warp)' },
    { label: 'Support Generation', val: 'DISABLED (Sphere geometry bridges naturally without support)' }
  ];

  const copyAsText = () => {
    const text = slicingSettings.map((s) => `${s.label}: ${s.val}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-space-900 border border-space-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-space-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Bambu Studio & OrcaSlicer Lithophane Profile
              </h3>
              <p className="text-xs text-slate-400">
                Optimized specifically for the Bambu Lab A1 Mini (0.4mm nozzle)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-space-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Critical Rule Callout */}
        <div className="my-4 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-300">Golden Lithophane Rule: </span>
            Set Wall Loops to 99 (or 100% Infill). If you slice a lithophane with standard 15% grid infill, the infill lines will cast dark shadow crosses right across your customer's faces when backlit!
          </div>
        </div>

        {/* Settings Table */}
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {slicingSettings.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 bg-space-850/80 rounded-lg text-xs border border-space-800"
            >
              <span className="font-medium text-slate-300">{item.label}</span>
              <span className="font-mono text-slate-200 text-right max-w-[55%]">{item.val}</span>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-4 border-t border-space-800 flex items-center justify-between">
          <button
            onClick={copyAsText}
            className="px-4 py-2 bg-space-800 hover:bg-space-700 text-slate-200 rounded-xl text-xs font-mono flex items-center gap-2 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied to Clipboard' : 'Copy All Parameters'}
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-lunar-gold text-space-950 font-semibold rounded-xl text-xs hover:bg-amber-300 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
