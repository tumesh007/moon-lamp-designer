import React from 'react';
import { X, FileText, ShoppingBag, ExternalLink, CheckCircle } from 'lucide-react';

interface BomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BillOfMaterialsModal: React.FC<BomModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const bomItems = [
    {
      item: '5V USB LED Puck Disc Light',
      specs: 'Diameter 35mm - 42mm, 5V 1A, Warm White 2700K or RGB',
      role: 'Installs securely into base central cavity pocket',
      estCost: '$1.80 – $3.50 / unit'
    },
    {
      item: 'USB Cable with Inline Touch Dimmer',
      specs: '1.5m length, standard USB-A/C with capacitive push switch',
      role: 'Passes cleanly through the base underside U-channel slot',
      estCost: '$1.20 – $2.00 / unit'
    },
    {
      item: 'White PLA Filament (Lithophane Grade)',
      specs: 'Bambu Lab Jade White PLA or Polymaker PolyLite White',
      role: 'Prints the translucent moon shell with optimal light scattering',
      estCost: '$18.00 / 1kg spool (~12-14 lamps per spool)'
    },
    {
      item: 'Base Stand Filament',
      specs: 'Wood PLA (30% wood fiber) or Matte Black / Marble PLA',
      role: 'Prints the weighted standalone pedestal and 3D engraved text',
      estCost: '$22.00 / 1kg spool'
    },
    {
      item: 'Silicone Rubber Feet Bumpers',
      specs: 'Diameter 8mm x 2mm height, self-adhesive clear pads (4x)',
      role: 'Prevents scratching desks and provides acoustic vibration damping',
      estCost: '$0.05 / 4-pack'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-space-900 border border-space-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-space-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Hardware Bill of Materials (BOM)
              </h3>
              <p className="text-xs text-slate-400">
                Off-the-shelf components designed to fit the mechanical STL clearances
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

        {/* Items List */}
        <div className="my-4 space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {bomItems.map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-space-850/80 rounded-xl border border-space-800 space-y-1 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-sm">{item.item}</span>
                <span className="font-mono text-emerald-400">{item.estCost}</span>
              </div>
              <p className="text-slate-300 font-mono text-[11px]">{item.specs}</p>
              <p className="text-slate-400 text-[11px] flex items-center gap-1.5 pt-0.5">
                <CheckCircle className="w-3.5 h-3.5 text-lunar-gold flex-shrink-0" />
                {item.role}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-space-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-space-800 hover:bg-space-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Close BOM
          </button>
        </div>
      </div>
    </div>
  );
};
