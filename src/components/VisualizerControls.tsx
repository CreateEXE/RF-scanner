import React from 'react';
import { VisualizerMode } from '../types/audio';
import { BarChart3, Activity, Waves, Disc3, Grid } from 'lucide-react';

interface VisualizerControlsProps {
  mode: VisualizerMode;
  onModeChange: (mode: VisualizerMode) => void;
  sensitivity: number;
  onSensitivityChange: (val: number) => void;
}

export const VisualizerControls: React.FC<VisualizerControlsProps> = ({
  mode,
  onModeChange,
  sensitivity,
  onSensitivityChange,
}) => {
  const MODES: { id: VisualizerMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'bars', label: 'Spectrum Bars', icon: BarChart3 },
    { id: 'curve', label: 'Smooth Curve', icon: Activity },
    { id: 'wave', label: 'Oscilloscope', icon: Waves },
    { id: 'radial', label: 'Radial Circle', icon: Disc3 },
    { id: 'spectrogram', label: 'Spectrogram', icon: Grid },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-xl px-4 py-2.5">
      {/* Mode Buttons */}
      <div className="flex items-center gap-1 overflow-x-auto">
        <span className="text-[11px] text-slate-400 font-medium mr-1 sr-only sm:not-sr-only">
          View Mode:
        </span>
        {MODES.map((m) => {
          const Icon = m.icon;
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onModeChange(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap border ${
                active
                  ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                  : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sensitivity Slider */}
      <div className="flex items-center gap-2 justify-end">
        <span className="text-[11px] text-slate-400 whitespace-nowrap">Gain / Sensitivity:</span>
        <input
          type="range"
          min="0.5"
          max="2.5"
          step="0.1"
          value={sensitivity}
          onChange={(e) => onSensitivityChange(Number(e.target.value))}
          className="w-20 sm:w-24 accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />
        <span className="text-[11px] font-mono text-slate-300 w-8 text-right">
          {sensitivity.toFixed(1)}x
        </span>
      </div>
    </div>
  );
};
