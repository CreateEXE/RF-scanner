export type VisualizerMode = 'bars' | 'curve' | 'wave' | 'radial' | 'spectrogram';

export type FrequencyBandId = 'all' | 'bass' | 'mids' | 'highs' | 'vocal' | 'custom';

export interface FrequencyBand {
  id: FrequencyBandId;
  label: string;
  minHz: number;
  maxHz: number;
  description: string;
  color: string;
}

export const FREQUENCY_BANDS: FrequencyBand[] = [
  {
    id: 'all',
    label: 'Full Spectrum',
    minHz: 20,
    maxHz: 20000,
    description: 'Complete audible human hearing range (20 Hz - 20 kHz)',
    color: '#38bdf8', // sky-400
  },
  {
    id: 'bass',
    label: 'Bass (20 - 200 Hz)',
    minHz: 20,
    maxHz: 200,
    description: 'Sub-bass and low-end kick/bass punch (20 Hz - 200 Hz)',
    color: '#a855f7', // purple-500
  },
  {
    id: 'mids',
    label: 'Mids (200 Hz - 2 kHz)',
    minHz: 200,
    maxHz: 2000,
    description: 'Instruments, guitars, speech body, and resonance (200 Hz - 2 kHz)',
    color: '#06b6d4', // cyan-500
  },
  {
    id: 'highs',
    label: 'Highs (2 - 20 kHz)',
    minHz: 2000,
    maxHz: 20000,
    description: 'Cymbals, hi-hats, vocal breath, and harmonic air (2 kHz - 20 kHz)',
    color: '#ec4899', // pink-500
  },
  {
    id: 'vocal',
    label: 'Vocal (300 Hz - 3.4 kHz)',
    minHz: 300,
    maxHz: 3400,
    description: 'Standard telephony and speech intelligibility band (300 Hz - 3.4 kHz)',
    color: '#10b981', // emerald-500
  },
  {
    id: 'custom',
    label: 'Custom Band',
    minHz: 100,
    maxHz: 8000,
    description: 'User-defined frequency limits',
    color: '#f59e0b', // amber-500
  },
];

export type AudioSourceType = 'mic' | 'generator' | 'demo' | 'file';

export type WaveformType = 'sine' | 'square' | 'triangle' | 'sawtooth' | 'whitenoise' | 'pinknoise' | 'sweep';

export type UconnectChannel = 'A' | 'B' | 'both';

export interface ChannelSettings {
  enabled: boolean;
  source: 'generator' | 'mic' | 'demo';
  volume: number; // 0 to 1
  generatorWave: WaveformType;
  generatorFrequency: number; // Hz
}

export interface UconnectDeviceProfile {
  name: string;
  technology: 'Dual-Channel Infrared (IR)' | '900 MHz RF' | '2.4 GHz RF';
  batteries: '2x AAA (1.5V Alkaline or 1.2V NiMH)';
  channelAFreq: string;
  channelBFreq: string;
  typicalVehicles: string;
}
