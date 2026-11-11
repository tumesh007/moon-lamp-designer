import React from 'react';
import { BaseSettings } from '../../types/designer';
import { Type, Sparkles, Sliders } from 'lucide-react';

interface Step6Props {
  baseSettings: BaseSettings;
  onUpdateBase: (settings: Partial<BaseSettings>) => void;
}

export const Step6EngravingText: React.FC<Step6Props> = ({ baseSettings, onUpdateBase }) => {
  const fonts = [
    { id: 'sans', label: 'Modern Sans', previewClass: 'font-sans' },
    { id: 'serif', label: 'Classical Roman', previewClass: 'font-serif' },
    { id: 'cinzel', label: 'Cinzel Monumental', previewClass: 'font-serif tracking-widest' },
    { id: 'script', label: 'Calligraphic Cursive', previewClass: 'italic' }
  ] as const;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white tracking-tight">Step 6: Add Name, Date or Message</h2>
        <p className="text-sm text-slate-400 mt-1">
          Personalize the lamp base with 3D embossed text that prints directly onto the front face.
        </p>
      </div>

      {/* Live Text 3D Engraving Mockup Card */}
      <div className="p-4 bg-gradient-to-b from-space-900 to-space-850 border border-space-700/80 rounded-xl space-y-2 text-center shadow-inner">
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
          Base Engraving Preview (3D Embossed)
        </span>

        <div className="p-4 min-h-[90px] rounded-lg bg-space-950/80 border border-space-800 flex flex-col items-center justify-center space-y-1">
          {baseSettings.textLine1 ? (
            <p className="text-base font-semibold tracking-wide text-lunar-warm uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {baseSettings.textLine1}
            </p>
          ) : (
            <p className="text-xs text-slate-600 italic">Line 1: Customer Names</p>
          )}

          {baseSettings.textLine2 && (
            <p className="text-xs font-mono text-slate-300 tracking-wider">
              {baseSettings.textLine2}
            </p>
          )}

          {baseSettings.textLine3 && (
            <p className="text-xs text-slate-400 italic">
              "{baseSettings.textLine3}"
            </p>
          )}
        </div>
      </div>

      {/* Input Lines */}
      <div className="space-y-3 p-4 bg-space-900/90 border border-space-800 rounded-xl">
        {/* Line 1 */}
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1">
            Line 1: Names / Main Heading
          </label>
          <input
            type="text"
            maxLength={26}
            placeholder="e.g. Emma & David"
            value={baseSettings.textLine1}
            onChange={(e) => onUpdateBase({ textLine1: e.target.value })}
            className="w-full px-3 py-2 bg-space-800 border border-space-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lunar-gold"
          />
        </div>

        {/* Line 2 */}
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1">
            Line 2: Date / Coordinates / Occasion
          </label>
          <input
            type="text"
            maxLength={30}
            placeholder="e.g. October 14, 2024"
            value={baseSettings.textLine2}
            onChange={(e) => onUpdateBase({ textLine2: e.target.value })}
            className="w-full px-3 py-2 bg-space-800 border border-space-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lunar-gold"
          />
        </div>

        {/* Line 3 */}
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1">
            Line 3: Personal Message / Quote
          </label>
          <input
            type="text"
            maxLength={40}
            placeholder="e.g. To the Moon and Back"
            value={baseSettings.textLine3}
            onChange={(e) => onUpdateBase({ textLine3: e.target.value })}
            className="w-full px-3 py-2 bg-space-800 border border-space-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lunar-gold"
          />
        </div>

        {/* Emboss Relief Depth Slider */}
        <div className="pt-2">
          <div className="flex justify-between items-center text-xs text-slate-300 mb-1">
            <span className="flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-slate-400" /> 3D Emboss Relief Depth:
            </span>
            <span className="font-mono text-lunar-warm">{baseSettings.embossDepth.toFixed(1)} mm</span>
          </div>
          <input
            type="range"
            min="0.6"
            max="2.0"
            step="0.1"
            value={baseSettings.embossDepth}
            onChange={(e) => onUpdateBase({ embossDepth: Number(e.target.value) })}
            className="w-full h-1.5 bg-space-800 rounded-lg appearance-none cursor-pointer accent-lunar-gold"
          />
          <span className="text-[10px] text-slate-500">
            Recommended 1.0mm for clean visibility with 0.4mm 3D printer nozzle.
          </span>
        </div>
      </div>
    </div>
  );
};
