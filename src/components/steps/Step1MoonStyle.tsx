import React from 'react';
import { MoonStyle } from '../../types/designer';
import { Circle, Moon, Disc, Globe, Sparkles, Sliders } from 'lucide-react';

interface Step1Props {
  currentStyle: MoonStyle;
  onSelectStyle: (style: MoonStyle) => void;
}

interface StyleCardData {
  id: MoonStyle;
  title: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
  characteristics: string[];
}

export const Step1MoonStyle: React.FC<Step1Props> = ({ currentStyle, onSelectStyle }) => {
  const styles: StyleCardData[] = [
    {
      id: 'full_moon_lithophane',
      title: 'Full Moon Lithophane',
      badge: 'Bestseller',
      description: 'Customer photograph integrated seamlessly across the spherical lunar surface.',
      icon: <Globe className="w-6 h-6 text-lunar-gold" />,
      characteristics: ['Panoramic 140° photo wrap', 'High-detail back craters', 'Maximum photo display area']
    },
    {
      id: 'photo_window',
      title: 'Moon with Photo Window',
      badge: 'Popular',
      description: 'Authentic cratered moon globe with a circular photo section framed by a raised crater ridge.',
      icon: <Disc className="w-6 h-6 text-amber-300" />,
      characteristics: ['Defined circular photo frame', 'Authentic lunar far-side', 'Distinct decorative crater rim']
    },
    {
      id: 'half_moon',
      title: 'Half Moon Lithophane',
      badge: 'Artistic',
      description: 'Crescent-shaped celestial moon with high-contrast portrait lithophane integration.',
      icon: <Moon className="w-6 h-6 text-sky-300" />,
      characteristics: ['Dramatic crescent geometry', 'Ideal for couple silhouettes', 'Contrasting illuminated rim']
    },
    {
      id: 'premium_globe',
      title: 'Premium Moon Globe',
      badge: 'Ultra High-Res',
      description: 'Spherical moon with deep multi-scale crater topography and smooth photo fusion.',
      icon: <Sparkles className="w-6 h-6 text-emerald-400" />,
      characteristics: ['Deep Copernicus-style craters', 'Enhanced tactile relief', 'Luxury desktop centerpiece']
    },
    {
      id: 'minimal_moon',
      title: 'Minimal Moon',
      badge: 'Modern',
      description: 'Sleek, velvety moon surface with subtle micro-craters and crisp photographic clarity.',
      icon: <Circle className="w-6 h-6 text-slate-300" />,
      characteristics: ['Understated architectural finish', 'Clean modern aesthetic', 'Zero visual clutter']
    },
    {
      id: 'custom',
      title: 'Custom Configuration',
      badge: 'Advanced',
      description: 'Full manual control over crater depth, noise frequencies, photo span, and wall tolerances.',
      icon: <Sliders className="w-6 h-6 text-purple-400" />,
      characteristics: ['Granular slider control', 'Custom aperture sizing', 'Pro-maker customization']
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white tracking-tight">Step 1: Select Moon Style</h2>
        <p className="text-sm text-slate-400 mt-1">
          Choose the foundation aesthetic for your 3D printed lithophane moon lamp.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
        {styles.map((style) => {
          const isSelected = currentStyle === style.id;
          return (
            <div
              key={style.id}
              onClick={() => onSelectStyle(style.id)}
              className={`group relative p-4 rounded-xl border cursor-pointer transition-all duration-200 select-none ${
                isSelected
                  ? 'bg-space-850/90 border-lunar-gold ring-1 ring-lunar-gold/50 shadow-[0_0_20px_rgba(245,192,101,0.15)]'
                  : 'bg-space-900/60 border-space-700/60 hover:border-space-600 hover:bg-space-850/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl border ${
                      isSelected
                        ? 'bg-lunar-gold/15 border-lunar-gold/40'
                        : 'bg-space-800 border-space-700'
                    }`}
                  >
                    {style.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-100 text-sm group-hover:text-white flex items-center gap-2">
                      {style.title}
                    </h3>
                    <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded bg-space-800 text-slate-300 border border-space-700">
                      {style.badge}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                {style.description}
              </p>

              <div className="mt-3 pt-3 border-t border-space-800/80 space-y-1">
                {style.characteristics.map((char, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="w-1 h-1 rounded-full bg-lunar-gold" />
                    <span>{char}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
