import React from 'react';
import { BaseSettings, BaseStyle } from '../../types/designer';
import { Cylinder, Disc, Layers, Sparkles, Box, Sliders } from 'lucide-react';

interface Step5Props {
  baseSettings: BaseSettings;
  onUpdateBase: (settings: Partial<BaseSettings>) => void;
}

export const Step5BaseDesign: React.FC<Step5Props> = ({ baseSettings, onUpdateBase }) => {
  const baseStyles: { id: BaseStyle; title: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'plain_circular',
      title: 'Plain Circular',
      desc: 'Smooth beveled cylinder for a clean contemporary profile.',
      icon: <Disc className="w-5 h-5 text-lunar-gold" />
    },
    {
      id: 'wooden_cylindrical',
      title: 'Wooden Fluted Slat',
      desc: 'Architectural vertical fluted grooves inspired by Nordic woodcraft.',
      icon: <Layers className="w-5 h-5 text-amber-400" />
    },
    {
      id: 'modern_minimalist',
      title: 'Modern Minimalist',
      desc: 'Octagonal tapered stand with crisp geometric facets.',
      icon: <Box className="w-5 h-5 text-sky-400" />
    },
    {
      id: 'premium_decorative',
      title: 'Premium Stepped Pedestal',
      desc: 'Classical multi-tiered pedestal with flared shoulder & base.',
      icon: <Sparkles className="w-5 h-5 text-emerald-400" />
    },
    {
      id: 'name_engraved',
      title: 'Name-Engraved Plaque',
      desc: 'Dedicated front face with precision 3D embossed typography.',
      icon: <Cylinder className="w-5 h-5 text-purple-400" />
    },
    {
      id: 'custom_text',
      title: 'Custom Multi-Line Text',
      desc: 'Extended front perimeter for multi-line quotes and dates.',
      icon: <Sliders className="w-5 h-5 text-rose-400" />
    }
  ];

  const finishes: { id: BaseSettings['materialFinish']; label: string; color: string }[] = [
    { id: 'walnut', label: 'Walnut Wood', color: '#2b1d14' },
    { id: 'oak', label: 'Golden Oak', color: '#c29b68' },
    { id: 'slate_dark', label: 'Dark Slate', color: '#1e293b' },
    { id: 'white_marble', label: 'White Marble', color: '#f8fafc' },
    { id: 'matte_black', label: 'Matte Stealth', color: '#090d16' }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white tracking-tight">Step 5: Select Base Design</h2>
        <p className="text-sm text-slate-400 mt-1">
          Pick an interchangeable base stand with integrated LED cavity and underside cable slot.
        </p>
      </div>

      {/* Base Styles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {baseStyles.map((style) => {
          const isSelected = baseSettings.style === style.id;
          return (
            <div
              key={style.id}
              onClick={() => onUpdateBase({ style: style.id })}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-space-850/90 border-lunar-gold ring-1 ring-lunar-gold/40 shadow-[0_0_15px_rgba(245,192,101,0.15)]'
                  : 'bg-space-900/60 border-space-700/60 hover:border-space-600 hover:bg-space-850/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg border ${
                    isSelected ? 'bg-lunar-gold/20 border-lunar-gold/40' : 'bg-space-800 border-space-700'
                  }`}
                >
                  {style.icon}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-100">{style.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{style.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Base Dimensions & Material */}
      <div className="p-4 bg-space-900/90 border border-space-800 rounded-xl space-y-3.5">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Base Stand Dimensions
        </h4>

        {/* Base Diameter */}
        <div>
          <div className="flex justify-between items-center text-xs text-slate-300 mb-1">
            <span>Base Diameter:</span>
            <span className="font-mono text-lunar-warm">{baseSettings.diameter} mm</span>
          </div>
          <input
            type="range"
            min="65"
            max="120"
            step="2"
            value={baseSettings.diameter}
            onChange={(e) => onUpdateBase({ diameter: Number(e.target.value) })}
            className="w-full h-1.5 bg-space-800 rounded-lg appearance-none cursor-pointer accent-lunar-gold"
          />
        </div>

        {/* Base Height */}
        <div>
          <div className="flex justify-between items-center text-xs text-slate-300 mb-1">
            <span>Base Height:</span>
            <span className="font-mono text-lunar-warm">{baseSettings.height} mm</span>
          </div>
          <input
            type="range"
            min="16"
            max="45"
            step="1"
            value={baseSettings.height}
            onChange={(e) => onUpdateBase({ height: Number(e.target.value) })}
            className="w-full h-1.5 bg-space-800 rounded-lg appearance-none cursor-pointer accent-lunar-gold"
          />
        </div>

        {/* Material Finish Palette */}
        <div className="pt-2">
          <label className="text-xs text-slate-300 block mb-2">Simulated Base Finish:</label>
          <div className="grid grid-cols-5 gap-2">
            {finishes.map((f) => (
              <button
                key={f.id}
                onClick={() => onUpdateBase({ materialFinish: f.id })}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                  baseSettings.materialFinish === f.id
                    ? 'border-lunar-gold bg-lunar-gold/15 text-white'
                    : 'border-space-700 bg-space-900 text-slate-400 hover:border-space-600'
                }`}
              >
                <span
                  className="w-5 h-5 rounded-full border border-space-600 shadow-sm"
                  style={{ backgroundColor: f.color }}
                />
                <span className="text-[10px] truncate max-w-full">{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Underside Cable Outlet Slot */}
        <div className="pt-2 border-t border-space-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-200">Underside USB Cable Channel</span>
            <p className="text-[11px] text-slate-400">
              U-channel (6.5mm × 4.0mm) allows USB wire to route out flat without wobble
            </p>
          </div>
          <input
            type="checkbox"
            checked={baseSettings.cableOutlet}
            onChange={(e) => onUpdateBase({ cableOutlet: e.target.checked })}
            className="w-4 h-4 accent-lunar-gold rounded cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
