import React from 'react';
import { FrequencyBand, FREQUENCY_BANDS } from '../types/audio';
import { Sliders, Layers } from 'lucide-react';

interface BandSelectorProps {
  selectedBand: FrequencyBand;
  onSelectBand: (band: FrequencyBand) => void;
  onUpdateCustomBand: (minHz: number, maxHz: number) => void;
}

export const BandSelector: React.FC<BandSelectorProps> = ({
  selectedBand,
  onSelectBand,
  onUpdateCustomBand,
}) => {
  const isCustom = selectedBand.id === 'custom';

  return (
    <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-sky-400" />
          <h3 className="font-semibold text-slate-100 text-sm tracking-wide">
            Frequency Band Focus
          </h3>
        </div>

        {/* Dropdown Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="band-dropdown" className="text-xs text-slate-400 sr-only">
            Select Band:
          </label>
          <select
            id="band-dropdown"
            value={selectedBand.id}
            onChange={(e) => {
              const band = FREQUENCY_BANDS.find((b) => b.id === e.target.value);
              if (band) onSelectBand(band);
            }}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
          >
            {FREQUENCY_BANDS.map((band) => (
              <option key={band.id} value={band.id}>
                {band.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Selection Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
        {FREQUENCY_BANDS.map((band) => {
          const active = selectedBand.id === band.id;
          return (
            <button
              key={band.id}
              onClick={() => onSelectBand(band)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left flex flex-col justify-between border ${
                active
                  ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-sm'
                  : 'bg-slate-800/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="truncate">{band.label.split('(')[0].trim()}</span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: band.color }}
                />
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                {band.minHz} - {band.maxHz >= 1000 ? `${band.maxHz / 1000}k` : band.maxHz} Hz
              </span>
            </button>
          );
        })}
      </div>

      {/* Frequency Band Info Note */}
      <p className="text-xs text-slate-400">
        {selectedBand.description}
      </p>

      {/* Custom Frequency Slider Controls */}
      {isCustom && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-3 bg-slate-950/60 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <Sliders className="w-3.5 h-3.5" />
            <span>Custom Band Frequency Sliders</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Low Cutoff (Min):</span>
                <span className="font-mono text-sky-400 font-semibold">{selectedBand.minHz} Hz</span>
              </div>
              <input
                type="range"
                min="20"
                max="5000"
                step="10"
                value={selectedBand.minHz}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onUpdateCustomBand(Math.min(val, selectedBand.maxHz - 20), selectedBand.maxHz);
                }}
                className="w-full accent-sky-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>High Cutoff (Max):</span>
                <span className="font-mono text-sky-400 font-semibold">
                  {selectedBand.maxHz >= 1000 ? `${(selectedBand.maxHz / 1000).toFixed(1)} kHz` : `${selectedBand.maxHz} Hz`}
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="20000"
                step="50"
                value={selectedBand.maxHz}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onUpdateCustomBand(selectedBand.minHz, Math.max(val, selectedBand.minHz + 20));
                }}
                className="w-full accent-sky-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
