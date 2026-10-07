import React from 'react';
import { Mic, Radio, Music, Square, Play, Sparkles } from 'lucide-react';
import { AudioSourceType } from '../types/audio';
import { audioEngine } from '../services/audioEngine';

interface AudioSourceSelectorProps {
  currentSource: AudioSourceType;
  isRunning: boolean;
  onSourceChange: (source: AudioSourceType) => void;
}

export const AudioSourceSelector: React.FC<AudioSourceSelectorProps> = ({
  currentSource,
  isRunning,
  onSourceChange,
}) => {
  const handleSelect = async (source: AudioSourceType) => {
    if (isRunning && currentSource === source) {
      audioEngine.stop();
      onSourceChange('generator');
      return;
    }

    if (source === 'mic') {
      const ok = await audioEngine.startMicrophone();
      if (ok) onSourceChange('mic');
    } else if (source === 'generator') {
      await audioEngine.startGenerator();
      onSourceChange('generator');
    } else if (source === 'demo') {
      await audioEngine.startDemoTrack();
      onSourceChange('demo');
    }
  };

  const SOURCES = [
    {
      id: 'mic' as AudioSourceType,
      label: 'Live Microphone',
      desc: 'Real-time room sound & voice FFT',
      icon: Mic,
      color: 'text-emerald-400',
    },
    {
      id: 'generator' as AudioSourceType,
      label: '2-Channel Uconnect Signal',
      desc: 'Channel 1/2 tones, sine, & sweeps',
      icon: Radio,
      color: 'text-sky-400',
    },
    {
      id: 'demo' as AudioSourceType,
      label: 'Ambient Demo Track',
      desc: 'Stereo chords & frequency dynamics',
      icon: Music,
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>Audio Input Source</span>
        </h3>
        <span
          className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
            isRunning
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {isRunning ? '● ENGINE RUNNING' : '○ ENGINE STOPPED'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {SOURCES.map((s) => {
          const active = isRunning && currentSource === s.id;
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => handleSelect(s.id)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-1.5 ${
                active
                  ? 'bg-sky-500/15 border-sky-400 text-sky-200 shadow-md ring-1 ring-sky-400/30'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${s.color}`} />
                  <span className="font-semibold text-xs text-slate-100">{s.label}</span>
                </div>
                {active ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                ) : (
                  <Play className="w-3 h-3 text-slate-500" />
                )}
              </div>
              <p className="text-[10px] text-slate-400">{s.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
