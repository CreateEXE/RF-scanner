import React from 'react';
import { Volume2, AlertTriangle, Zap, RotateCcw } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

interface ThresholdControlProps {
  thresholdDb: number;
  currentDb: number;
  peakDb: number;
  isBreached: boolean;
  onThresholdChange: (db: number) => void;
  highlightColor: string;
  onHighlightColorChange: (color: string) => void;
  breachCount: number;
  onResetBreachCount: () => void;
}

export const ThresholdControl: React.FC<ThresholdControlProps> = ({
  thresholdDb,
  currentDb,
  peakDb,
  isBreached,
  onThresholdChange,
  highlightColor,
  onHighlightColorChange,
  breachCount,
  onResetBreachCount,
}) => {
  // Map dB (-90 to 0) to 0-100% for progress bars
  const dbToPercent = (db: number) => {
    return Math.max(0, Math.min(100, ((db + 90) / 90) * 100));
  };

  const currentPercent = dbToPercent(currentDb);
  const peakPercent = dbToPercent(peakDb);
  const thresholdPercent = dbToPercent(thresholdDb);

  const COLOR_PRESETS = [
    { label: 'Neon Red', value: '#ef4444' },
    { label: 'Hot Amber', value: '#f59e0b' },
    { label: 'Electric Pink', value: '#ec4899' },
    { label: 'Acid Lime', value: '#84cc16' },
  ];

  return (
    <div
      className={`bg-slate-900/90 backdrop-blur border rounded-xl p-4 shadow-lg transition-all space-y-4 ${
        isBreached
          ? 'border-red-500/80 shadow-red-500/10'
          : 'border-slate-800'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg ${
              isBreached ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-sky-400'
            }`}
          >
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">Decibel Threshold Trigger</h3>
            <p className="text-[11px] text-slate-400">
              Triggers visual highlight & color shift when audio exceeds limit
            </p>
          </div>
        </div>

        {/* Live Breach Status Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${
              isBreached
                ? 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {isBreached ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>LIMIT BREACHED</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>NORMAL</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Live Decibel Meter Graphic */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-mono text-slate-300">
          <span>Current: <strong className="text-sky-400 font-bold">{currentDb > -90 ? `${currentDb} dBFS` : 'SILENT'}</strong></span>
          <span>Peak Hold: <strong className="text-amber-400 font-bold">{peakDb > -90 ? `${peakDb} dBFS` : '-'}</strong></span>
          <span>Threshold: <strong className="text-red-400 font-bold">{thresholdDb} dBFS</strong></span>
        </div>

        {/* Visual Meter Bar */}
        <div className="relative h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          {/* Current Level */}
          <div
            className={`h-full transition-all duration-75 rounded-full ${
              isBreached ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-gradient-to-r from-sky-600 to-sky-400'
            }`}
            style={{ width: `${currentPercent}%` }}
          />

          {/* Peak Hold Marker */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-amber-300 shadow-sm transition-all"
            style={{ left: `${peakPercent}%` }}
          />

          {/* Threshold Marker Pin */}
          <div
            className="absolute top-0 bottom-0 w-1.5 bg-red-500 shadow-lg z-10 -ml-0.5"
            style={{ left: `${thresholdPercent}%` }}
          />
        </div>

        {/* Scale labels */}
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>-90 dB</span>
          <span>-60 dB</span>
          <span>-30 dB</span>
          <span>-10 dB</span>
          <span>0 dBFS</span>
        </div>
      </div>

      {/* Threshold Slider */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-300 font-medium flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Set Threshold Slider:
          </span>
          <span className="font-mono text-sm font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-900/60">
            {thresholdDb} dBFS
          </span>
        </div>
        <input
          type="range"
          min="-70"
          max="-3"
          step="1"
          value={thresholdDb}
          onChange={(e) => {
            const val = Number(e.target.value);
            onThresholdChange(val);
            audioEngine.setThreshold(val);
          }}
          className="w-full accent-red-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
        />
      </div>

      {/* Highlight Color & Breach Counter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Highlight Color:</span>
          <div className="flex items-center gap-1">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color.value}
                onClick={() => onHighlightColorChange(color.value)}
                className={`w-5 h-5 rounded-full border-2 transition-transform ${
                  highlightColor === color.value ? 'scale-125 border-white ring-1 ring-white/40' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.label}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-mono text-[11px]">
            Breaches: <strong className="text-slate-200">{breachCount}</strong>
          </span>
          <button
            onClick={() => {
              onResetBreachCount();
              audioEngine.resetPeakHold();
            }}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
            title="Reset breach count and peak hold"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
