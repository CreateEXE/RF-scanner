import { FrequencyBand, WaveformType } from '../types/audio';

export interface AudioEngineMetrics {
  currentDb: number;
  peakDb: number;
  isThresholdBreached: boolean;
  activeFrequency: number;
}

export type MetricsCallback = (metrics: AudioEngineMetrics) => void;

class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: AudioNode | null = null;
  private micStream: MediaStream | null = null;

  // Dual-channel generation nodes
  private channelAGain: GainNode | null = null;
  private channelBGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private channelAPanner: StereoPannerNode | null = null;
  private channelBPanner: StereoPannerNode | null = null;
  private oscA: OscillatorNode | null = null;
  private oscB: OscillatorNode | null = null;
  private noiseNodeA: AudioBufferSourceNode | null = null;
  private noiseNodeB: AudioBufferSourceNode | null = null;
  private sweepTimer: number | null = null;

  // State
  private isRunning: boolean = false;
  private currentSource: 'mic' | 'generator' | 'demo' = 'generator';
  private dbThreshold: number = -24; // dBFS
  private metricsCallback: MetricsCallback | null = null;
  private animFrameId: number | null = null;
  private peakHoldDb: number = -100;
  private peakDecay: number = 0.96;

  // Channel 1 / 2 settings
  public channel1Enabled: boolean = true;
  public channel2Enabled: boolean = true;
  public channel1Volume: number = 0.8;
  public channel2Volume: number = 0.8;
  public channel1Freq: number = 440;
  public channel2Freq: number = 1000;
  public channel1Wave: WaveformType = 'sine';
  public channel2Wave: WaveformType = 'sine';

  constructor() {
    // Lazy initialized on first user interaction to comply with browser autoplay policies
  }

  public async initContext(): Promise<AudioContext> {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    return this.ctx;
  }

  public setupAnalyser() {
    if (!this.ctx) return;
    if (!this.analyser) {
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.85;
      this.analyser.minDecibels = -90;
      this.analyser.maxDecibels = -10;
    }
  }

  public setThreshold(db: number) {
    this.dbThreshold = db;
  }

  public getThreshold(): number {
    return this.dbThreshold;
  }

  public onMetrics(cb: MetricsCallback) {
    this.metricsCallback = cb;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getContext(): AudioContext | null {
    return this.ctx;
  }

  public isActive(): boolean {
    return this.isRunning;
  }

  // Start microphone capture
  public async startMicrophone(): Promise<boolean> {
    try {
      const ctx = await this.initContext();
      this.stopCurrentSource();
      this.setupAnalyser();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      this.micStream = stream;
      const micSource = ctx.createMediaStreamSource(stream);
      this.sourceNode = micSource;

      // Connect mic to analyser only (not to destination to avoid feedback howl)
      micSource.connect(this.analyser!);

      this.currentSource = 'mic';
      this.isRunning = true;
      this.startMetricsLoop();
      return true;
    } catch (err) {
      console.error('Failed to access microphone', err);
      return false;
    }
  }

  // Start 2-Channel Signal / Tone Generator
  public async startGenerator(): Promise<void> {
    const ctx = await this.initContext();
    this.stopCurrentSource();
    this.setupAnalyser();

    // Master node -> analyser -> speakers
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.5, ctx.currentTime);

    this.masterGain.connect(this.analyser!);
    this.analyser!.connect(ctx.destination);

    // Channel 1 (Simulating Uconnect Channel 1 / Left)
    this.channel1Volume = this.channel1Volume ?? 0.8;
    this.channelAGain = ctx.createGain();
    this.channelAGain.gain.setValueAtTime(this.channel1Enabled ? this.channel1Volume : 0, ctx.currentTime);

    this.channelAPanner = ctx.createStereoPanner();
    this.channelAPanner.pan.setValueAtTime(-1, ctx.currentTime); // Hard Left = Channel 1

    this.channelAGain.connect(this.channelAPanner);
    this.channelAPanner.connect(this.masterGain);

    // Channel 2 (Simulating Uconnect Channel 2 / Right)
    this.channel2Volume = this.channel2Volume ?? 0.8;
    this.channelBGain = ctx.createGain();
    this.channelBGain.gain.setValueAtTime(this.channel2Enabled ? this.channel2Volume : 0, ctx.currentTime);

    this.channelBPanner = ctx.createStereoPanner();
    this.channelBPanner.pan.setValueAtTime(1, ctx.currentTime); // Hard Right = Channel 2

    this.channelBGain.connect(this.channelBPanner);
    this.channelBPanner.connect(this.masterGain);

    this.restartOscillators();

    this.currentSource = 'generator';
    this.isRunning = true;
    this.startMetricsLoop();
  }

  public setChannel1Volume(vol: number) {
    this.channel1Volume = vol;
    if (this.channelAGain && this.ctx) {
      this.channelAGain.gain.setTargetAtTime(this.channel1Enabled ? vol : 0, this.ctx.currentTime, 0.05);
    }
  }

  public setChannel2Volume(vol: number) {
    this.channel2Volume = vol;
    if (this.channelBGain && this.ctx) {
      this.channelBGain.gain.setTargetAtTime(this.channel2Enabled ? vol : 0, this.ctx.currentTime, 0.05);
    }
  }

  public toggleChannel1(enabled: boolean) {
    this.channel1Enabled = enabled;
    this.setChannel1Volume(this.channel1Volume);
  }

  public toggleChannel2(enabled: boolean) {
    this.channel2Enabled = enabled;
    this.setChannel2Volume(this.channel2Volume);
  }

  public setChannel1Freq(freq: number) {
    this.channel1Freq = freq;
    if (this.oscA && this.ctx) {
      this.oscA.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.05);
    }
  }

  public setChannel2Freq(freq: number) {
    this.channel2Freq = freq;
    if (this.oscB && this.ctx) {
      this.oscB.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.05);
    }
  }

  public setChannel1Wave(wave: WaveformType) {
    this.channel1Wave = wave;
    if (this.isRunning && this.currentSource === 'generator') {
      this.restartOscillators();
    }
  }

  public setChannel2Wave(wave: WaveformType) {
    this.channel2Wave = wave;
    if (this.isRunning && this.currentSource === 'generator') {
      this.restartOscillators();
    }
  }

  // Play battery sag / frequency sweep test (20Hz to 20kHz)
  public playDiagnosticSweep(channel: '1' | '2' | 'both', durationSec: number = 6) {
    if (!this.ctx || !this.isRunning) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;

    const runSweepOn = (gainNode: GainNode, panner: StereoPannerNode, panVal: number) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(20, now);
      osc.frequency.exponentialRampToValueAtTime(18000, now + durationSec);

      const localGain = ctx.createGain();
      localGain.gain.setValueAtTime(0, now);
      localGain.gain.linearRampToValueAtTime(0.7, now + 0.1);
      localGain.gain.setValueAtTime(0.7, now + durationSec - 0.2);
      localGain.gain.linearRampToValueAtTime(0, now + durationSec);

      osc.connect(localGain);
      localGain.connect(panner);
      osc.start(now);
      osc.stop(now + durationSec + 0.1);
    };

    if ((channel === '1' || channel === 'both') && this.channelAPanner) {
      runSweepOn(this.channelAGain!, this.channelAPanner, -1);
    }
    if ((channel === '2' || channel === 'both') && this.channelBPanner) {
      runSweepOn(this.channelBGain!, this.channelBPanner, 1);
    }
  }

  private restartOscillators() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    // Stop previous
    if (this.oscA) {
      try { this.oscA.stop(); } catch {}
      this.oscA.disconnect();
      this.oscA = null;
    }
    if (this.oscB) {
      try { this.oscB.stop(); } catch {}
      this.oscB.disconnect();
      this.oscB = null;
    }
    if (this.noiseNodeA) {
      try { this.noiseNodeA.stop(); } catch {}
      this.noiseNodeA.disconnect();
      this.noiseNodeA = null;
    }
    if (this.noiseNodeB) {
      try { this.noiseNodeB.stop(); } catch {}
      this.noiseNodeB.disconnect();
      this.noiseNodeB = null;
    }

    // Channel 1 Source
    if (this.channel1Wave === 'whitenoise' || this.channel1Wave === 'pinknoise') {
      this.noiseNodeA = this.createNoiseNode(this.channel1Wave === 'pinknoise');
      this.noiseNodeA.connect(this.channelAGain!);
      this.noiseNodeA.start();
    } else {
      this.oscA = ctx.createOscillator();
      this.oscA.type = this.channel1Wave as OscillatorType;
      this.oscA.frequency.setValueAtTime(this.channel1Freq, ctx.currentTime);
      this.oscA.connect(this.channelAGain!);
      this.oscA.start();
    }

    // Channel 2 Source
    if (this.channel2Wave === 'whitenoise' || this.channel2Wave === 'pinknoise') {
      this.noiseNodeB = this.createNoiseNode(this.channel2Wave === 'pinknoise');
      this.noiseNodeB.connect(this.channelBGain!);
      this.noiseNodeB.start();
    } else {
      this.oscB = ctx.createOscillator();
      this.oscB.type = this.channel2Wave as OscillatorType;
      this.oscB.frequency.setValueAtTime(this.channel2Freq, ctx.currentTime);
      this.oscB.connect(this.channelBGain!);
      this.oscB.start();
    }
  }

  private createNoiseNode(isPink: boolean): AudioBufferSourceNode {
    if (!this.ctx) throw new Error('No audio context');
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (isPink) {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    } else {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }

    const node = this.ctx.createBufferSource();
    node.buffer = buffer;
    node.loop = true;
    return node;
  }

  // Play pleasant musical chord demonstration (for testing dynamics & visualizer)
  public async startDemoTrack(): Promise<void> {
    const ctx = await this.initContext();
    this.stopCurrentSource();
    this.setupAnalyser();

    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.6, ctx.currentTime);
    this.masterGain.connect(this.analyser!);
    this.analyser!.connect(ctx.destination);

    // Create dual channel demo arpeggiator / ambient drone
    const chordNotesCh1 = [130.81, 164.81, 196.00, 261.63]; // C3, E3, G3, C4
    const chordNotesCh2 = [293.66, 329.63, 392.00, 523.25]; // D4, E4, G4, C5

    const ch1Panner = ctx.createStereoPanner();
    ch1Panner.pan.setValueAtTime(-0.8, ctx.currentTime);
    ch1Panner.connect(this.masterGain);

    const ch2Panner = ctx.createStereoPanner();
    ch2Panner.pan.setValueAtTime(0.8, ctx.currentTime);
    ch2Panner.connect(this.masterGain);

    let step = 0;
    const interval = setInterval(() => {
      if (!this.isRunning || this.currentSource !== 'demo') {
        clearInterval(interval);
        return;
      }
      const now = ctx.currentTime;
      // Channel 1 note
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(chordNotesCh1[step % chordNotesCh1.length], now);
      gain1.gain.setValueAtTime(0.4, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc1.connect(gain1);
      gain1.connect(ch1Panner);
      osc1.start(now);
      osc1.stop(now + 0.85);

      // Channel 2 note with offset
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(chordNotesCh2[(step + 2) % chordNotesCh2.length], now + 0.2);
      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.setValueAtTime(0.35, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
      osc2.connect(gain2);
      gain2.connect(ch2Panner);
      osc2.start(now + 0.2);
      osc2.stop(now + 1.05);

      step++;
    }, 400);

    this.currentSource = 'demo';
    this.isRunning = true;
    this.startMetricsLoop();
  }

  public stop(): void {
    this.stopCurrentSource();
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private stopCurrentSource() {
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    if (this.sourceNode) {
      try { this.sourceNode.disconnect(); } catch {}
      this.sourceNode = null;
    }
    if (this.oscA) {
      try { this.oscA.stop(); } catch {}
      this.oscA.disconnect();
      this.oscA = null;
    }
    if (this.oscB) {
      try { this.oscB.stop(); } catch {}
      this.oscB.disconnect();
      this.oscB = null;
    }
    if (this.noiseNodeA) {
      try { this.noiseNodeA.stop(); } catch {}
      this.noiseNodeA.disconnect();
      this.noiseNodeA = null;
    }
    if (this.noiseNodeB) {
      try { this.noiseNodeB.stop(); } catch {}
      this.noiseNodeB.disconnect();
      this.noiseNodeB = null;
    }
    if (this.masterGain) {
      try { this.masterGain.disconnect(); } catch {}
      this.masterGain = null;
    }
  }

  // Real-time Decibel calculation and Peak Hold
  private startMetricsLoop() {
    if (!this.analyser) return;

    const buffer = new Float32Array(this.analyser.fftSize);
    const freqData = new Float32Array(this.analyser.frequencyBinCount);

    const update = () => {
      if (!this.isRunning || !this.analyser) return;

      this.analyser.getFloatTimeDomainData(buffer);
      this.analyser.getFloatFrequencyData(freqData);

      // Calculate RMS dBFS
      let sumSquares = 0;
      for (let i = 0; i < buffer.length; i++) {
        sumSquares += buffer[i] * buffer[i];
      }
      const rms = Math.sqrt(sumSquares / buffer.length);
      // Avoid log(0)
      const currentDb = rms > 0.000001 ? 20 * Math.log10(rms) : -100;

      // Peak Hold with Decay
      if (currentDb > this.peakHoldDb) {
        this.peakHoldDb = currentDb;
      } else {
        this.peakHoldDb = Math.max(-100, this.peakHoldDb * this.peakDecay);
      }

      // Check threshold breach
      const isThresholdBreached = currentDb >= this.dbThreshold;

      // Detect peak frequency
      let maxMag = -Infinity;
      let peakBin = 0;
      for (let i = 0; i < freqData.length; i++) {
        if (freqData[i] > maxMag) {
          maxMag = freqData[i];
          peakBin = i;
        }
      }
      const nyquist = (this.ctx?.sampleRate || 44100) / 2;
      const activeFrequency = Math.round((peakBin / freqData.length) * nyquist);

      if (this.metricsCallback) {
        this.metricsCallback({
          currentDb: Math.round(currentDb * 10) / 10,
          peakDb: Math.round(this.peakHoldDb * 10) / 10,
          isThresholdBreached,
          activeFrequency,
        });
      }

      this.animFrameId = requestAnimationFrame(update);
    };

    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.animFrameId = requestAnimationFrame(update);
  }

  public resetPeakHold() {
    this.peakHoldDb = -100;
  }
}

export const audioEngine = new AudioEngine();
