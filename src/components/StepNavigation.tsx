import React from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface StepNavProps {
  currentStep: number;
  onSetStep: (step: number) => void;
  maxReachedStep: number;
}

export const StepNavigation: React.FC<StepNavProps> = ({
  currentStep,
  onSetStep,
  maxReachedStep
}) => {
  const stepTitles = [
    'Style',
    'Photo',
    'Editor',
    'Size',
    'Base',
    'Engrave',
    'Light',
    'Review',
    'Mesh STL',
    'Export'
  ];

  const goBack = () => {
    if (currentStep > 1) onSetStep(currentStep - 1);
  };

  const goNext = () => {
    if (currentStep < 10) onSetStep(currentStep + 1);
  };

  return (
    <div className="bg-space-950/90 border-t border-space-800/80 px-4 py-2.5 flex items-center justify-between select-none">
      {/* Back Button */}
      <button
        onClick={goBack}
        disabled={currentStep === 1}
        className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1 transition-all ${
          currentStep > 1
            ? 'bg-space-900 border-space-700 text-slate-200 hover:bg-space-850 hover:border-space-600'
            : 'border-space-800 text-slate-600 cursor-not-allowed'
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      {/* 10-Step Breadcrumb Stepper */}
      <div className="flex items-center gap-1 overflow-x-auto max-w-[70%] py-1 px-2 no-scrollbar">
        {stepTitles.map((title, idx) => {
          const stepNum = idx + 1;
          const isCurrent = currentStep === stepNum;
          const isCompleted = stepNum < currentStep;

          return (
            <button
              key={stepNum}
              onClick={() => onSetStep(stepNum)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex-shrink-0 ${
                isCurrent
                  ? 'bg-lunar-gold/20 text-lunar-warm border border-lunar-gold/50 shadow-[0_0_10px_rgba(245,192,101,0.2)] font-semibold'
                  : isCompleted
                  ? 'text-slate-300 hover:text-white hover:bg-space-850'
                  : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  isCurrent
                    ? 'bg-lunar-gold text-space-950 font-bold'
                    : isCompleted
                    ? 'bg-space-800 text-emerald-400'
                    : 'bg-space-900 text-slate-500'
                }`}
              >
                {isCompleted ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : stepNum}
              </span>
              <span className="hidden sm:inline">{title}</span>
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={goNext}
        disabled={currentStep === 10}
        className={`px-4 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
          currentStep < 10
            ? 'bg-lunar-gold border-lunar-gold text-space-950 hover:bg-amber-300 shadow-[0_0_15px_rgba(245,192,101,0.3)]'
            : 'border-space-800 text-slate-600 cursor-not-allowed'
        }`}
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
