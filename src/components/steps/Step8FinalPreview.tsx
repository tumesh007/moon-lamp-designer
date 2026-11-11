import React from 'react';
import {
  MoonDimensions,
  BaseSettings,
  LightingSettings,
  MoonStyle,
  SlicingEstimates,
  ViewportSettings
} from '../../types/designer';
import {
  CheckCircle2,
  AlertTriangle,
  Sun,
  Moon,
  Layers,
  Box,
  Scale,
  Clock,
  Printer
} from 'lucide-react';

interface Step8Props {
  style: MoonStyle;
  moonDimensions: MoonDimensions;
  baseSettings: BaseSettings;
  lightingSettings: LightingSettings;
  slicingEstimates: SlicingEstimates;
  viewportSettings: ViewportSettings;
  onUpdateViewport: (settings: Partial<ViewportSettings>) => void;
  onProceedToGenerate: () => void;
}

export const Step8FinalPreview: React.FC<Step8Props> = ({
  style,
  moonDimensions,
  baseSettings,
  lightingSettings,
  slicingEstimates,
  viewportSettings,
  onUpdateViewport,
  onProceedToGenerate
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white tracking-tight">Step 8: Preview Final Product in 3D</h2>
        <p className="text-sm text-slate-400 mt-1">
          Review the complete assembly, inspect mechanical fits, and verify Bambu Lab A1 Mini print readiness.
        </p>
      </div>

      {/* Interactive Quick-Toggles */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() =>
            onUpdateViewport({
              lightingMode: viewportSettings.lightingMode === 'night' ? 'day' : 'night'
            })
          }
          className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
            viewportSettings.lightingMode === 'night'
              ? 'bg-amber-500/15 border-amber-500/50 text-white'
              : 'bg-space-900 border-space-700 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {viewportSettings.lightingMode === 'night' ? (
              <Moon className="w-4 h-4 text-amber-400" />
            ) : (
              <Sun className="w-4 h-4 text-slate-300" />
            )}
            <span className="text-xs font-medium">Lighting Mode</span>
          </div>
          <span className="text-[11px] font-mono text-lunar-gold">
            {viewportSettings.lightingMode === 'night' ? 'Night Lit' : 'Day Studio'}
          </span>
        </button>

        <button
          onClick={() => onUpdateViewport({ explodedView: !viewportSettings.explodedView })}
          className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
            viewportSettings.explodedView
              ? 'bg-lunar-gold/20 border-lunar-gold text-white'
              : 'bg-space-900 border-space-700 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-lunar-gold" />
            <span className="text-xs font-medium">Assembly View</span>
          </div>
          <span className="text-[11px] font-mono text-lunar-gold">
            {viewportSettings.explodedView ? 'Exploded' : 'Assembled'}
          </span>
        </button>
      </div>

      {/* Bambu Lab A1 Mini Compatibility Checklist Card */}
      <div className="p-4 bg-space-900/90 border border-space-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Printer className="w-4 h-4 text-emerald-400" />
            Bambu Lab A1 Mini Pre-Flight Verification
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
              slicingEstimates.isExceedingBuildVolume
                ? 'bg-red-950 text-red-300 border border-red-500'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-500'
            }`}
          >
            {slicingEstimates.isExceedingBuildVolume ? 'Exceeds Bed' : '100% Compatible'}
          </span>
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Build Volume Constraint:</span>
            <span className="font-mono text-slate-200">180 × 180 × 180 mm</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Moon Outer Diameter:</span>
            <span className="font-mono text-lunar-warm">{moonDimensions.diameter} mm</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Base Stand Diameter:</span>
            <span className="font-mono text-slate-200">{baseSettings.diameter} mm</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Mounting Tolerance:</span>
            <span className="font-mono text-emerald-400">±{baseSettings.mountingTolerance} mm Slip-Fit</span>
          </div>
        </div>

        {slicingEstimates.warnings.length > 0 && (
          <div className="p-3 bg-amber-950/70 border border-amber-500/50 rounded-lg space-y-1">
            {slicingEstimates.warnings.map((warn, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{warn}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slicing & Filament Estimates Card */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 bg-space-900 border border-space-800 rounded-xl space-y-1">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Scale className="w-3.5 h-3.5 text-lunar-gold" /> Total Filament
          </span>
          <p className="text-lg font-semibold font-mono text-white">
            {slicingEstimates.totalFilamentGrams} <span className="text-xs text-slate-400">grams</span>
          </p>
          <p className="text-[10px] text-slate-500">
            Moon: ~{Math.round(slicingEstimates.moonVolumeCm3 * 1.24)}g | Base: ~{Math.round(slicingEstimates.baseVolumeCm3 * 1.24)}g
          </p>
        </div>

        <div className="p-3.5 bg-space-900 border border-space-800 rounded-xl space-y-1">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-400" /> Estimated Print Time
          </span>
          <p className="text-lg font-semibold font-mono text-white">
            {Math.floor(slicingEstimates.totalPrintTimeMinutes / 60)}h{' '}
            {slicingEstimates.totalPrintTimeMinutes % 60}m
          </p>
          <p className="text-[10px] text-slate-500">
            At 0.12mm litho perimeters
          </p>
        </div>
      </div>

      {/* Proceed Button */}
      <button
        onClick={onProceedToGenerate}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-lunar-gold via-amber-400 to-lunar-gold text-space-950 font-semibold rounded-xl shadow-[0_0_25px_rgba(245,192,101,0.35)] hover:shadow-[0_0_35px_rgba(245,192,101,0.5)] transition-all flex items-center justify-center gap-2 text-sm tracking-wide"
      >
        <CheckCircle2 className="w-4 h-4 text-space-950" />
        Proceed to Step 9: Generate High-Res STL
      </button>
    </div>
  );
};
