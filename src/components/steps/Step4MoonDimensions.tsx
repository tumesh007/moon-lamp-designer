import React from 'react';
import { MoonDimensions, SurfacePreset } from '../../types/designer';
import { Disc, Sliders, Layers, Sparkles, AlertTriangle } from 'lucide-react';

interface Step4Props {
  moonDimensions: MoonDimensions;
  onUpdateDimensions: (dimensions: Partial<MoonDimensions>) => void;
}

export const Step4MoonDimensions: React.FC<Step4Props> = ({
  moonDimensions,
  onUpdateDimensions
}) => {
  const presets: { id: SurfacePreset; label: string; desc: string }[] = [
    { id: 'realistic', label: 'Realistic', desc: 'Balanced Tycho/Copernicus crater impacts & maria' },
    { id: 'detailed', label: 'Detailed', desc: 'Enhanced sharp high-contrast crater relief' },
    { id: 'smooth', label: 'Smooth', desc: 'Soft gentle texture emphasizing photo lithophane' },
    { id: 'premium', label: 'Premium', desc: 'Max depth micro-topography & deep relief' },
    { id: 'minimal', label: 'Minimal', desc: 'Velvet subtle satin finish for clean look' }
  ];

  const applyPreset = (preset: SurfacePreset) => {
    switch (preset) {
      case 'realistic':
        onUpdateDimensions({
          preset,
          craterDensity: 0.8,
          craterSize: 1.0,
          surfaceRoughness: 0.5,
          textureIntensity: 0.8
        });
        break;
      case 'detailed':
        onUpdateDimensions({
          preset,
          craterDensity: 1.0,
          craterSize: 1.25,
          surfaceRoughness: 0.8,
          textureIntensity: 1.0
        });
        break;
      case 'smooth':
        onUpdateDimensions({
          preset,
          craterDensity: 0.25,
          craterSize: 0.7,
          surfaceRoughness: 0.15,
          textureIntensity: 0.3
        });
        break;
      case 'premium':
        onUpdateDimensions({
          preset,
          craterDensity: 0.95,
          craterSize: 1.15,
          surfaceRoughness: 0.7,
          textureIntensity: 0.95
        });
        break;
      case 'minimal':
        onUpdateDimensions({
          preset,
          craterDensity: 0.15,
          craterSize: 0.6,
          surfaceRoughness: 0.1,
          textureIntensity: 0.2
        });
        break;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white tracking-tight">Step 4: Select Moon Dimensions & Surface</h2>
        <p className="text-sm text-slate-400 mt-1">
          Configure size, wall thickness for optimal light diffusion, and surface topography.
        </p>
      </div>

      {/* Surface Presets */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-lunar-gold" />
          Surface Relief Presets:
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                moonDimensions.preset === p.id
                  ? 'bg-lunar-gold/20 border-lunar-gold text-white shadow-[0_0_12px_rgba(245,192,101,0.2)]'
                  : 'bg-space-900 border-space-700/80 text-slate-300 hover:border-space-600 hover:bg-space-850'
              }`}
            >
              <div className="text-xs font-semibold">{p.label}</div>
              <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Diameter & Sizing Card */}
      <div className="p-4 bg-space-900/90 border border-space-800 rounded-xl space-y-3.5">
        <div>
          <div className="flex justify-between items-center text-xs text-slate-300 mb-1">
            <span className="flex items-center gap-1.5 font-medium text-slate-200">
              <Disc className="w-4 h-4 text-lunar-gold" /> Moon Outer Diameter:
            </span>
            <span className="font-mono text-sm font-semibold text-lunar-gold">
              {moonDimensions.diameter} mm
            </span>
          </div>
          <input
            type="range"
            min="80"
            max="160"
            step="5"
            value={moonDimensions.diameter}
            onChange={(e) => onUpdateDimensions({ diameter: Number(e.target.value) })}
            className="w-full h-2 bg-space-800 rounded-lg appearance-none cursor-pointer accent-lunar-gold"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>80 mm (Petite)</span>
            <span>120 mm (Standard)</span>
            <span>150 mm (A1 Mini Max)</span>
          </div>
        </div>

        {moonDimensions.diameter > 150 && (
          <div className="flex items-center gap-2 p-2.5 bg-amber-950/70 border border-amber-500/40 rounded-lg text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              Diameters above 150mm approach the Bambu Lab A1 Mini 180mm print bed limit.
            </span>
          </div>
        )}

        {/* Base Wall Thickness */}
        <div>
          <div className="flex justify-between items-center text-xs text-slate-300 mb-1">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" /> Moon Shell Base Thickness:
            </span>
            <span className="font-mono text-lunar-warm">{moonDimensions.baseWallThickness.toFixed(1)} mm</span>
          </div>
          <input
            type="range"
            min="1.4"
            max="3.2"
            step="0.1"
            value={moonDimensions.baseWallThickness}
            onChange={(e) => onUpdateDimensions({ baseWallThickness: Number(e.target.value) })}
            className="w-full h-1.5 bg-space-800 rounded-lg appearance-none cursor-pointer accent-lunar-gold"
          />
        </div>

        {/* Litho Thickness Range (Min & Max) */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>Litho Min (Highlight):</span>
              <span className="font-mono text-emerald-400">{moonDimensions.lithoMinThickness.toFixed(1)} mm</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.4"
              step="0.1"
              value={moonDimensions.lithoMinThickness}
              onChange={(e) => onUpdateDimensions({ lithoMinThickness: Number(e.target.value) })}
              className="w-full h-1.5 bg-space-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>Litho Max (Shadow):</span>
              <span className="font-mono text-sky-400">{moonDimensions.lithoMaxThickness.toFixed(1)} mm</span>
            </div>
            <input
              type="range"
              min="2.2"
              max="3.6"
              step="0.1"
              value={moonDimensions.lithoMaxThickness}
              onChange={(e) => onUpdateDimensions({ lithoMaxThickness: Number(e.target.value) })}
              className="w-full h-1.5 bg-space-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>
        </div>

        {/* Exterior Photo Sculpt Relief */}
        <div className="pt-1 border-t border-space-800/80">
          <div className="flex justify-between items-center text-xs text-slate-300 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-lunar-gold" /> Exterior Photo Sculpt Relief:
            </span>
            <span className="font-mono text-sm font-semibold text-lunar-gold">
              {(moonDimensions.exteriorReliefDepth ?? 1.6).toFixed(1)} mm
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="2.5"
            step="0.1"
            value={moonDimensions.exteriorReliefDepth ?? 1.6}
            onChange={(e) => onUpdateDimensions({ exteriorReliefDepth: Number(e.target.value) })}
            className="w-full h-1.5 bg-space-800 rounded-lg appearance-none cursor-pointer accent-lunar-gold"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>0.0 mm (Flat / Interior Only)</span>
            <span>1.6 mm (Standard Sculpted)</span>
            <span>2.5 mm (Deep 3D Profile)</span>
          </div>
        </div>
      </div>

      {/* Surface Topography Advanced Sliders */}
      <div className="p-4 bg-space-900/90 border border-space-800 rounded-xl space-y-3">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-lunar-gold" />
          Surface Relief & Orientation
        </span>

        {/* Crater Density */}
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Crater Density:</span>
            <span className="font-mono text-lunar-warm">{Math.round(moonDimensions.craterDensity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={moonDimensions.craterDensity}
            onChange={(e) => onUpdateDimensions({ craterDensity: Number(e.target.value) })}
            className="w-full h-1.5 bg-space-800 rounded-lg appearance-none cursor-pointer accent-lunar-gold"
          />
        </div>

        {/* Surface Roughness */}
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Maria & Highland Roughness:</span>
            <span className="font-mono text-lunar-warm">{Math.round(moonDimensions.surfaceRoughness * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={moonDimensions.surfaceRoughness}
            onChange={(e) => onUpdateDimensions({ surfaceRoughness: Number(e.target.value) })}
            className="w-full h-1.5 bg-space-800 rounded-lg appearance-none cursor-pointer accent-lunar-gold"
          />
        </div>

        {/* Photo Coverage Span Angle */}
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Photo Arc Span:</span>
            <span className="font-mono text-lunar-warm">{moonDimensions.photoCoverageSpan}°</span>
          </div>
          <input
            type="range"
            min="60"
            max="180"
            step="5"
            value={moonDimensions.photoCoverageSpan}
            onChange={(e) => onUpdateDimensions({ photoCoverageSpan: Number(e.target.value) })}
            className="w-full h-1.5 bg-space-800 rounded-lg appearance-none cursor-pointer accent-lunar-gold"
          />
        </div>

        {/* Moon Orientation Yaw */}
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Moon Yaw Rotation:</span>
            <span className="font-mono text-lunar-warm">{moonDimensions.moonOrientation}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            step="5"
            value={moonDimensions.moonOrientation}
            onChange={(e) => onUpdateDimensions({ moonOrientation: Number(e.target.value) })}
            className="w-full h-1.5 bg-space-800 rounded-lg appearance-none cursor-pointer accent-lunar-gold"
          />
        </div>
      </div>
    </div>
  );
};
