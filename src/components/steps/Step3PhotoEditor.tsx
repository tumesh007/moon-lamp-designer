import React, { useState } from 'react';
import { PhotoSettings, CropShape } from '../../types/designer';
import {
  Crop,
  ZoomIn,
  Move,
  RotateCw,
  Sun,
  Contrast,
  Sliders,
  Sparkles,
  Layers,
  Eye,
  RefreshCw
} from 'lucide-react';

interface Step3Props {
  photoSettings: PhotoSettings;
  onUpdatePhoto: (settings: Partial<PhotoSettings>) => void;
  processedPreviewUrl: string;
}

export const Step3PhotoEditor: React.FC<Step3Props> = ({
  photoSettings,
  onUpdatePhoto,
  processedPreviewUrl
}) => {
  const [activeTab, setActiveTab] = useState<'adjust' | 'position'>('adjust');

  const shapes: { id: CropShape; label: string }[] = [
    { id: 'circle', label: 'Circle Mask' },
    { id: 'square', label: 'Square' },
    { id: 'portrait', label: 'Portrait (3:4)' },
    { id: 'landscape', label: 'Landscape (4:3)' }
  ];

  const resetAdjustments = () => {
    onUpdatePhoto({
      zoom: 1.0,
      panX: 0,
      panY: 0,
      rotation: 0,
      brightness: 0,
      contrast: 15,
      exposure: 0,
      gamma: 1.0,
      feather: 0.35,
      invert: false
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight">
            Step 3: Customize Photo & Lithophane
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Crop, adjust exposure, and preview how plastic thickness renders facial details.
          </p>
        </div>
        <button
          onClick={resetAdjustments}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-space-850 hover:bg-space-800 border border-space-700 rounded-lg text-xs font-mono text-slate-300 hover:text-white transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Dual Preview Box: Original / Processed Lithophane Height Map */}
      <div className="grid grid-cols-2 gap-3 p-3 bg-space-900/80 border border-space-800 rounded-xl">
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Eye className="w-3 h-3 text-lunar-gold" />
            Processed Lithophane Height Map
          </span>
          <div className="aspect-square rounded-lg bg-black overflow-hidden border border-space-800 flex items-center justify-center relative">
            {processedPreviewUrl ? (
              <img
                src={processedPreviewUrl}
                alt="Processed Lithophane"
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-xs text-slate-500">No image loaded</span>
            )}
            <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-space-950/80 backdrop-blur rounded text-[9px] font-mono text-slate-300">
              White = 0.8mm | Black = 3.0mm
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Simulated Backlit Lamp Glow
          </span>
          <div className="aspect-square rounded-lg bg-space-950 overflow-hidden border border-space-800 flex items-center justify-center relative shadow-[inset_0_0_30px_rgba(245,192,101,0.15)]">
            {processedPreviewUrl ? (
              <img
                src={processedPreviewUrl}
                alt="Simulated Backlit"
                className="w-full h-full object-contain filter invert sepia saturate-200 hue-rotate-[340deg] contrast-125 brightness-110"
              />
            ) : (
              <span className="text-xs text-slate-500">No image loaded</span>
            )}
            <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-space-950/80 backdrop-blur rounded text-[9px] font-mono text-amber-300">
              Translucent Warm White
            </div>
          </div>
        </div>
      </div>

      {/* Crop Shape Selector */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Crop className="w-3.5 h-3.5 text-lunar-gold" />
          Photo Framing Shape:
        </label>
        <div className="grid grid-cols-4 gap-2">
          {shapes.map((s) => (
            <button
              key={s.id}
              onClick={() => onUpdatePhoto({ cropShape: s.id })}
              className={`py-2 px-2 rounded-lg text-xs font-medium border transition-all text-center ${
                photoSettings.cropShape === s.id
                  ? 'bg-lunar-gold/20 border-lunar-gold text-lunar-warm shadow-[0_0_8px_rgba(245,192,101,0.2)]'
                  : 'bg-space-900 border-space-700/80 text-slate-400 hover:text-slate-200 hover:bg-space-850'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Controls Tabs */}
      <div className="flex border-b border-space-800 gap-4 pt-1">
        <button
          onClick={() => setActiveTab('adjust')}
          className={`pb-2 text-xs font-medium flex items-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'adjust'
              ? 'border-lunar-gold text-lunar-warm'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          Tone & Exposure
        </button>
        <button
          onClick={() => setActiveTab('position')}
          className={`pb-2 text-xs font-medium flex items-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'position'
              ? 'border-lunar-gold text-lunar-warm'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Move className="w-3.5 h-3.5" />
          Position, Zoom & Rotation
        </button>
      </div>

      {/* Tab 1: Tone & Exposure */}
      {activeTab === 'adjust' && (
        <div className="space-y-3.5 pt-1">
          {/* Contrast */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span className="flex items-center gap-1">
                <Contrast className="w-3 h-3 text-slate-400" /> Contrast
              </span>
              <span className="font-mono text-lunar-warm">{photoSettings.contrast > 0 ? `+${photoSettings.contrast}` : photoSettings.contrast}</span>
            </div>
            <input
              type="range"
              min="-50"
              max="80"
              value={photoSettings.contrast}
              onChange={(e) => onUpdatePhoto({ contrast: Number(e.target.value) })}
              className="w-full h-1.5 bg-space-800 rounded-lg appearance-none cursor-pointer accent-lunar-gold"
            />
          </div>

          {/* Brightness */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span className="flex items-center gap-1">
                <Sun className="w-3 h-3 text-slate-400" /> Brightness
              </span>
              <span className="font-mono text-lunar-warm">{photoSettings.brightness > 0 ? `+${photoSettings.brightness}` : photoSettings.brightness}</span>
            </div>
            <input
              type="range"
              min="-60"
              max="60"
              value={photoSettings.brightness}
              onChange={(e) => onUpdatePhoto({ brightness: Number(e.target.value) })}
              className="w-full h-1.5 bg-space-800 rounded-lg appearance-none cursor-pointer accent-lunar-gold"
            />
          </div>

          {/* Exposure */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span className="flex items-center gap-1">
                <Sliders className="w-3 h-3 text-slate-400" /> Facial Highlight Protection (Exposure)
              </span>
              <span className="font-mono text-lunar-warm">{photoSettings.exposure > 0 ? `+${photoSettings.exposure}` : photoSettings.exposure}</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={photoSettings.exposure}
              onChange={(e) => onUpdatePhoto({ exposure: Number(e.target.value) })}
              className="w-full h-1.5 bg-space-800 rounded-lg appearance-none cursor-pointer accent-lunar-gold"
            />
          </div>

          {/* Gamma Curve */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-slate-400" /> Gamma (Midtone Depth)
              </span>
              <span className="font-mono text-lunar-warm">{photoSettings.gamma.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.8"
              step="0.05"
              value={photoSettings.gamma}
              onChange={(e) => onUpdatePhoto({ gamma: Number(e.target.value) })}
              className="w-full h-1.5 bg-space-800 rounded-lg appearance-none cursor-pointer accent-lunar-gold"
            />
          </div>

          {/* Edge Feather */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-400" /> Border Feather Blend
              </span>
              <span className="font-mono text-lunar-warm">{Math.round(photoSettings.feather * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.8"
              step="0.05"
              value={photoSettings.feather}
              onChange={(e) => onUpdatePhoto({ feather: Number(e.target.value) })}
              className="w-full h-1.5 bg-space-800 rounded-lg appearance-none cursor-pointer accent-lunar-gold"
            />
          </div>

          {/* Invert Positive / Negative Toggle */}
          <div className="flex items-center justify-between p-3 bg-space-900 border border-space-800 rounded-xl">
            <div>
              <span className="text-xs font-medium text-slate-200">Negative Lithophane Invert</span>
              <p className="text-[11px] text-slate-400">Toggle if using special inverted backlit techniques</p>
            </div>
            <input
              type="checkbox"
              checked={photoSettings.invert}
              onChange={(e) => onUpdatePhoto({ invert: e.target.checked })}
              className="w-4 h-4 accent-lunar-gold rounded cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Tab 2: Position, Zoom & Rotation */}
      {activeTab === 'position' && (
        <div className="space-y-3.5 pt-1">
          {/* Zoom */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span className="flex items-center gap-1">
                <ZoomIn className="w-3 h-3 text-slate-400" /> Zoom Scale
              </span>
              <span className="font-mono text-lunar-warm">{photoSettings.zoom.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={photoSettings.zoom}
              onChange={(e) => onUpdatePhoto({ zoom: Number(e.target.value) })}
              className="w-full h-1.5 bg-space-800 rounded-lg appearance-none cursor-pointer accent-lunar-gold"
            />
          </div>

          {/* Pan X */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span className="flex items-center gap-1">
                <Move className="w-3 h-3 text-slate-400" /> Horizontal Shift (X)
              </span>
              <span className="font-mono text-lunar-warm">{photoSettings.panX}%</span>
            </div>
            <input
              type="range"
              min="-40"
              max="40"
              value={photoSettings.panX}
              onChange={(e) => onUpdatePhoto({ panX: Number(e.target.value) })}
              className="w-full h-1.5 bg-space-800 rounded-lg appearance-none cursor-pointer accent-lunar-gold"
            />
          </div>

          {/* Pan Y */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span className="flex items-center gap-1">
                <Move className="w-3 h-3 text-slate-400" /> Vertical Shift (Y)
              </span>
              <span className="font-mono text-lunar-warm">{photoSettings.panY}%</span>
            </div>
            <input
              type="range"
              min="-40"
              max="40"
              value={photoSettings.panY}
              onChange={(e) => onUpdatePhoto({ panY: Number(e.target.value) })}
              className="w-full h-1.5 bg-space-800 rounded-lg appearance-none cursor-pointer accent-lunar-gold"
            />
          </div>

          {/* Rotation */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span className="flex items-center gap-1">
                <RotateCw className="w-3 h-3 text-slate-400" /> Rotation
              </span>
              <span className="font-mono text-lunar-warm">{photoSettings.rotation}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={photoSettings.rotation}
              onChange={(e) => onUpdatePhoto({ rotation: Number(e.target.value) })}
              className="w-full h-1.5 bg-space-800 rounded-lg appearance-none cursor-pointer accent-lunar-gold"
            />
          </div>
        </div>
      )}
    </div>
  );
};
