import React from 'react';
import { LightingSettings, LightingType } from '../../types/designer';
import { Lightbulb, Zap, ShieldCheck, Sun, Info } from 'lucide-react';

interface Step7Props {
  lightingSettings: LightingSettings;
  onUpdateLighting: (settings: Partial<LightingSettings>) => void;
}

export const Step7LightingHardware: React.FC<Step7Props> = ({
  lightingSettings,
  onUpdateLighting
}) => {
  const lightingTypes: {
    id: LightingType;
    title: string;
    kelvinOrColor: string;
    desc: string;
    defaultHex: string;
  }[] = [
    {
      id: 'warm_white',
      title: 'Warm White (2700K)',
      kelvinOrColor: '2700K Cozy Glow',
      desc: 'Gentle golden candlelight hue, ideal for bedrooms and bedside tables.',
      defaultHex: '#ffd79a'
    },
    {
      id: 'cool_white',
      title: 'Cool White (6000K)',
      kelvinOrColor: '6000K Pure Moonlight',
      desc: 'Crisp bright celestial moonlight highlighting fine lithophane contrast.',
      defaultHex: '#e2e8f0'
    },
    {
      id: 'rgb',
      title: 'RGB Multi-Color',
      kelvinOrColor: '16 Million Colors',
      desc: 'Dynamic color transitions with touch or app-controlled illumination.',
      defaultHex: '#38bdf8'
    },
    {
      id: 'rgb_remote',
      title: 'RGB with Remote Control',
      kelvinOrColor: 'IR Wireless Remote',
      desc: 'Infrared remote control with brightness dimming and pulse modes.',
      defaultHex: '#a855f7'
    },
    {
      id: 'usb_puck',
      title: 'USB 5V LED Module',
      kelvinOrColor: 'Standard 40mm Puck',
      desc: 'Universal USB-powered LED light disc with integrated inline cable switch.',
      defaultHex: '#ffedd5'
    },
    {
      id: 'replaceable_module',
      title: 'Modular Twist-In Puck',
      kelvinOrColor: 'Quick Replace',
      desc: 'Tool-free replaceable LED core for commercial durability.',
      defaultHex: '#fef08a'
    }
  ];

  const handleSelectType = (item: (typeof lightingTypes)[0]) => {
    onUpdateLighting({
      type: item.id,
      color: item.defaultHex
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white tracking-tight">Step 7: Select Lighting & Hardware</h2>
        <p className="text-sm text-slate-400 mt-1">
          Configure simulated internal light color and mechanical hardware accommodation.
        </p>
      </div>

      {/* Lighting Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {lightingTypes.map((item) => {
          const isSelected = lightingSettings.type === item.id;
          return (
            <div
              key={item.id}
              onClick={() => handleSelectType(item)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-space-850/90 border-lunar-gold ring-1 ring-lunar-gold/40 shadow-[0_0_15px_rgba(245,192,101,0.15)]'
                  : 'bg-space-900/60 border-space-700/60 hover:border-space-600 hover:bg-space-850/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className="w-4 h-4 rounded-full mt-0.5 border border-white/20 shadow-sm flex-shrink-0"
                  style={{ backgroundColor: item.defaultHex }}
                />
                <div>
                  <h4 className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                    {item.title}
                  </h4>
                  <span className="text-[10px] font-mono text-lunar-gold">{item.kelvinOrColor}</span>
                  <p className="text-[11px] text-slate-400 mt-1">{item.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Brightness & Color Tuning */}
      <div className="p-4 bg-space-900/90 border border-space-800 rounded-xl space-y-3.5">
        <div>
          <div className="flex justify-between items-center text-xs text-slate-300 mb-1">
            <span className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-lunar-gold" /> Simulated Illumination Intensity:
            </span>
            <span className="font-mono text-lunar-warm">{lightingSettings.brightness}%</span>
          </div>
          <input
            type="range"
            min="20"
            max="150"
            step="5"
            value={lightingSettings.brightness}
            onChange={(e) => onUpdateLighting({ brightness: Number(e.target.value) })}
            className="w-full h-1.5 bg-space-800 rounded-lg appearance-none cursor-pointer accent-lunar-gold"
          />
        </div>

        {/* Custom Color Swatch */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-300">Custom Glow Color:</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={lightingSettings.color}
              onChange={(e) => onUpdateLighting({ color: e.target.value })}
              className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-space-700"
            />
            <span className="font-mono text-xs text-slate-400">{lightingSettings.color.toUpperCase()}</span>
          </div>
        </div>

        {/* Printable Snap-In Diffuser Dome Cap */}
        <div className="pt-2 border-t border-space-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Printable Snap-In LED Diffuser Dome STL
            </span>
            <p className="text-[11px] text-slate-400">
              Generates a lightweight snap-fit frosted dome to prevent LED point hotspots
            </p>
          </div>
          <input
            type="checkbox"
            checked={lightingSettings.diffuserCap}
            onChange={(e) => onUpdateLighting({ diffuserCap: e.target.checked })}
            className="w-4 h-4 accent-lunar-gold rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Electrical Hardware Separation Notice */}
      <div className="p-3 bg-space-900/60 border border-space-800 rounded-xl flex items-start gap-2.5 text-xs text-slate-400">
        <Info className="w-4 h-4 text-lunar-gold flex-shrink-0 mt-0.5" />
        <p>
          In accordance with 3D manufacturing standards, no electrical circuits are embedded into the STL.
          The STL generates mechanical mounts sized for standard 35–45mm USB LED discs, and provides a separate Bill of Materials (BOM) in Step 10.
        </p>
      </div>
    </div>
  );
};
