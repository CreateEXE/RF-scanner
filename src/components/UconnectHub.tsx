import React, { useState } from 'react';
import {
  Headphones,
  Radio,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Play,
  Square,
  Volume2,
  VolumeX,
  Battery,
  Car,
  Tv,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { WaveformType } from '../types/audio';

export const UconnectHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'routing' | 'setup' | 'battery' | 'diagnostics'>('routing');
  const [isPlaying, setIsPlaying] = useState(false);
  const [sweepActive, setSweepActive] = useState(false);

  // Channel 1 & 2 state
  const [ch1Vol, setCh1Vol] = useState(80);
  const [ch2Vol, setCh2Vol] = useState(80);
  const [ch1Freq, setCh1Freq] = useState(440); // 440 Hz (A4)
  const [ch2Freq, setCh2Freq] = useState(1000); // 1000 Hz calibration
  const [ch1Wave, setCh1Wave] = useState<WaveformType>('sine');
  const [ch2Wave, setCh2Wave] = useState<WaveformType>('sine');
  const [ch1Muted, setCh1Muted] = useState(false);
  const [ch2Muted, setCh2Muted] = useState(false);

  const startOrStop = async () => {
    if (isPlaying) {
      audioEngine.stop();
      setIsPlaying(false);
    } else {
      await audioEngine.startGenerator();
      audioEngine.setChannel1Volume(ch1Muted ? 0 : ch1Vol / 100);
      audioEngine.setChannel2Volume(ch2Muted ? 0 : ch2Vol / 100);
      audioEngine.setChannel1Freq(ch1Freq);
      audioEngine.setChannel2Freq(ch2Freq);
      audioEngine.setChannel1Wave(ch1Wave);
      audioEngine.setChannel2Wave(ch2Wave);
      setIsPlaying(true);
    }
  };

  const testChannelSolo = async (ch: '1' | '2') => {
    if (!isPlaying) {
      await audioEngine.startGenerator();
      setIsPlaying(true);
    }
    if (ch === '1') {
      audioEngine.setChannel1Volume(0.85);
      audioEngine.setChannel2Volume(0);
      setCh1Muted(false);
      setCh2Muted(true);
    } else {
      audioEngine.setChannel1Volume(0);
      audioEngine.setChannel2Volume(0.85);
      setCh1Muted(true);
      setCh2Muted(false);
    }
  };

  const testPingPong = async () => {
    if (!isPlaying) {
      await audioEngine.startGenerator();
      setIsPlaying(true);
    }
    let state = false;
    audioEngine.setChannel1Volume(0.8);
    audioEngine.setChannel2Volume(0);
    const interval = setInterval(() => {
      state = !state;
      if (state) {
        audioEngine.setChannel1Volume(0);
        audioEngine.setChannel2Volume(0.8);
        setCh1Muted(true);
        setCh2Muted(false);
      } else {
        audioEngine.setChannel1Volume(0.8);
        audioEngine.setChannel2Volume(0);
        setCh1Muted(false);
        setCh2Muted(true);
      }
    }, 1200);

    setTimeout(() => {
      clearInterval(interval);
      audioEngine.setChannel1Volume(ch1Vol / 100);
      audioEngine.setChannel2Volume(ch2Vol / 100);
      setCh1Muted(false);
      setCh2Muted(false);
    }, 9600);
  };

  const runBatterySweep = async (target: '1' | '2' | 'both') => {
    if (!isPlaying) {
      await audioEngine.startGenerator();
      setIsPlaying(true);
    }
    setSweepActive(true);
    audioEngine.playDiagnosticSweep(target, 5);
    setTimeout(() => {
      setSweepActive(false);
    }, 5500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Top Banner / Device Identification */}
      <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-slate-900 p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-100">
                Uconnect® 2-Channel Wireless Headphone Hub
              </h2>
              <span className="bg-sky-500/20 text-sky-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-sky-500/40">
                OEM Model Matched
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Identified: Chrysler / Dodge / Jeep Uconnect VES Dual-Channel Infrared (IR) Headphones with 1/2 Switch & AAA Batteries
            </p>
          </div>
        </div>

        {/* Start / Stop Main Audio Generator */}
        <div className="flex items-center gap-2">
          <button
            onClick={startOrStop}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              isPlaying
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/30'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                <span>Stop 2-Ch Audio</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start 2-Ch Audio</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/60 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('routing')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'routing'
              ? 'border-sky-400 text-sky-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Channel 1 / 2 Audio Router</span>
        </button>

        <button
          onClick={() => setActiveTab('setup')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'setup'
              ? 'border-sky-400 text-sky-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>How to Connect & Transponder Guide</span>
        </button>

        <button
          onClick={() => setActiveTab('battery')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'battery'
              ? 'border-sky-400 text-sky-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Battery className="w-4 h-4" />
          <span>AAA Battery & Driver Stress Test</span>
        </button>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'diagnostics'
              ? 'border-sky-400 text-sky-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Hardware Specs & Troubleshooting</span>
        </button>
      </div>

      {/* TAB 1: 2-Channel Audio Router */}
      {activeTab === 'routing' && (
        <div className="p-5 space-y-6">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Radio className="w-4 h-4 text-sky-400" />
                <span>Discrete Dual-Channel Audio Signal Generator</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Uconnect 2-channel headphones switch between <strong>Channel 1</strong> (Left Stereo Carrier 2.3MHz) and <strong>Channel 2</strong> (Right Stereo Carrier 3.2MHz). Use this panel to send separate audio signals to each channel.
              </p>
            </div>

            {/* Quick Test Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => testChannelSolo('1')}
                className="px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 hover:bg-sky-500/20 text-sky-300 text-xs font-medium transition-all"
              >
                Solo Channel 1 (A)
              </button>
              <button
                onClick={() => testChannelSolo('2')}
                className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 text-purple-300 text-xs font-medium transition-all"
              >
                Solo Channel 2 (B)
              </button>
              <button
                onClick={testPingPong}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium transition-all"
              >
                Ping-Pong Test (Flip 1/2)
              </button>
            </div>
          </div>

          {/* Dual Channel Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Channel 1 Box */}
            <div className="bg-slate-950/60 border border-sky-500/30 rounded-xl p-4 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs font-mono">
                    CH 1
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-sky-200">Uconnect Channel 1</h5>
                    <p className="text-[11px] text-slate-400">Headphone Switch on "1" • Left Stereo Out</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const next = !ch1Muted;
                    setCh1Muted(next);
                    audioEngine.toggleChannel1(!next);
                  }}
                  className={`p-1.5 rounded-lg border text-xs transition-colors ${
                    ch1Muted
                      ? 'bg-red-500/20 border-red-500/40 text-red-400'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  {ch1Muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Waveform Selector */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Waveform Signal:</label>
                <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                  {(['sine', 'triangle', 'square', 'pinknoise'] as WaveformType[]).map((w) => (
                    <button
                      key={w}
                      onClick={() => {
                        setCh1Wave(w);
                        audioEngine.setChannel1Wave(w);
                      }}
                      className={`py-1 rounded capitalize font-medium border ${
                        ch1Wave === w
                          ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {w === 'pinknoise' ? 'Pink Noise' : w}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency Slider */}
              {ch1Wave !== 'pinknoise' && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Frequency:</span>
                    <span className="font-mono text-sky-400 font-bold">{ch1Freq} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="4000"
                    step="10"
                    value={ch1Freq}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setCh1Freq(v);
                      audioEngine.setChannel1Freq(v);
                    }}
                    className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>40 Hz (Bass)</span>
                    <span>440 Hz (Standard A)</span>
                    <span>4 kHz (High)</span>
                  </div>
                </div>
              )}

              {/* Volume Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Channel 1 Volume:</span>
                  <span className="font-mono text-slate-300">{ch1Muted ? 'Muted' : `${ch1Vol}%`}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ch1Muted ? 0 : ch1Vol}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setCh1Vol(v);
                    setCh1Muted(false);
                    audioEngine.setChannel1Volume(v / 100);
                  }}
                  className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Channel 2 Box */}
            <div className="bg-slate-950/60 border border-purple-500/30 rounded-xl p-4 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs font-mono">
                    CH 2
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-purple-200">Uconnect Channel 2</h5>
                    <p className="text-[11px] text-slate-400">Headphone Switch on "2" • Right Stereo Out</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const next = !ch2Muted;
                    setCh2Muted(next);
                    audioEngine.toggleChannel2(!next);
                  }}
                  className={`p-1.5 rounded-lg border text-xs transition-colors ${
                    ch2Muted
                      ? 'bg-red-500/20 border-red-500/40 text-red-400'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  {ch2Muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Waveform Selector */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Waveform Signal:</label>
                <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                  {(['sine', 'triangle', 'square', 'pinknoise'] as WaveformType[]).map((w) => (
                    <button
                      key={w}
                      onClick={() => {
                        setCh2Wave(w);
                        audioEngine.setChannel2Wave(w);
                      }}
                      className={`py-1 rounded capitalize font-medium border ${
                        ch2Wave === w
                          ? 'bg-purple-500/20 border-purple-400 text-purple-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {w === 'pinknoise' ? 'Pink Noise' : w}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency Slider */}
              {ch2Wave !== 'pinknoise' && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Frequency:</span>
                    <span className="font-mono text-purple-400 font-bold">{ch2Freq} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="4000"
                    step="10"
                    value={ch2Freq}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setCh2Freq(v);
                      audioEngine.setChannel2Freq(v);
                    }}
                    className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>40 Hz (Bass)</span>
                    <span>1000 Hz (Calib Tone)</span>
                    <span>4 kHz (High)</span>
                  </div>
                </div>
              )}

              {/* Volume Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Channel 2 Volume:</span>
                  <span className="font-mono text-slate-300">{ch2Muted ? 'Muted' : `${ch2Vol}%`}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ch2Muted ? 0 : ch2Vol}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setCh2Vol(v);
                    setCh2Muted(false);
                    audioEngine.setChannel2Volume(v / 100);
                  }}
                  className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: How to Connect & Transponder Guide */}
      {activeTab === 'setup' && (
        <div className="p-5 space-y-6">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Radio className="w-5 h-5 text-sky-400" />
              <span>How to Connect Your Phone to Uconnect 1/2 Wireless Headphones</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your headphones in the photo are Chrysler/Dodge/Jeep OEM <strong>dual-channel Infrared (IR) wireless headphones</strong>. Because smartphones do not have optical 2.3MHz/3.2MHz IR LED audio transmitters built in, you need a transponder bridge. Here are the 3 ways to connect:
            </p>
          </div>

          {/* 3 Methods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Method 1: The Vehicle Uconnect Way */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">Method 1 (In Vehicle)</span>
                    <h4 className="text-sm font-bold text-slate-100">Car Uconnect Transponder</h4>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Uses your vehicle’s factory roof IR transmitter as the transponder. No extra purchases needed!
                </p>
                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside pt-1">
                  <li>Pair your phone to Uconnect via <strong>Bluetooth</strong> or <strong>Aux/USB</strong>.</li>
                  <li>In the Uconnect Radio screen, tap <strong>Media</strong> or <strong>Rear Seat Entertainment (VES)</strong>.</li>
                  <li>Set Rear Source to your Phone audio (Screen 1 or Screen 2).</li>
                  <li>Turn on headphones, slide switch to <strong>1</strong> (or <strong>2</strong>). Audio will play crystal clear!</li>
                </ol>
              </div>
              <div className="text-[11px] bg-emerald-950/40 text-emerald-300 p-2.5 rounded-lg border border-emerald-900/60 font-medium">
                ✓ Best for: Listening in Chrysler Town & Country, Pacifica, Dodge Caravan, Durango, Jeep Grand Cherokee.
              </div>
            </div>

            {/* Method 2: Portable 3.5mm IR Transponder */}
            <div className="bg-slate-950/80 border border-sky-500/40 rounded-xl p-4 flex flex-col justify-between space-y-3 relative shadow-lg shadow-sky-500/5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
                    <Tv className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-sky-400 uppercase font-bold tracking-wider">Method 2 (At Home / Desk)</span>
                    <h4 className="text-sm font-bold text-slate-100">Portable 3.5mm IR Box</h4>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Turn your phone or PC into a standalone transmitter anywhere in your home using a small universal IR module ($12-$18).
                </p>
                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside pt-1">
                  <li>Get a universal <strong>2-Channel Automotive IR Audio Transmitter</strong> with 3.5mm aux input.</li>
                  <li>Plug 3.5mm cable into your phone’s headphone jack (or USB-C audio adapter).</li>
                  <li>Power the transmitter via USB (5V) or 12V adapter.</li>
                  <li>Aim transmitter LEDs at your headphones: Switch 1 or 2 receives the exact audio!</li>
                </ol>
              </div>
              <div className="text-[11px] bg-sky-950/40 text-sky-300 p-2.5 rounded-lg border border-sky-900/60 font-medium">
                ✓ Best for: Using your Uconnect headphones with phones, laptops, TVs, or gaming consoles outside the car.
              </div>
            </div>

            {/* Method 3: Phone-to-Screen Web Transponder */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-purple-400 uppercase font-bold tracking-wider">Method 3 (Multi-Device)</span>
                    <h4 className="text-sm font-bold text-slate-100">HDMI / Aux Relay Bridge</h4>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  If your vehicle has rear HDMI or RCA inputs (common on Pacifica & Town & Country rear consoles):
                </p>
                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside pt-1">
                  <li>Plug a USB-C to HDMI adapter or Chromecast into the car’s rear console HDMI port.</li>
                  <li>Mirror or cast this Frequency Visualizer app from your phone to the rear screen.</li>
                  <li>The car screen automatically broadcasts the audio to your headphones on Channel 1 or 2!</li>
                </ol>
              </div>
              <div className="text-[11px] bg-purple-950/40 text-purple-300 p-2.5 rounded-lg border border-purple-900/60 font-medium">
                ✓ Best for: Watching movies or visualizers on the car ceiling screen with wireless audio.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AAA Battery & Driver Stress Test */}
      {activeTab === 'battery' && (
        <div className="p-5 space-y-5">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                <Battery className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">
                  Uconnect Headphone AAA Battery Health & Voltage Sag Diagnostic
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Because these headphones run on <strong>2x AAA batteries (3.0V nominal)</strong>, when batteries drop below ~2.3V under load, the internal IR receiver amplifier suffers <em>voltage sag</em>. This causes:
                </p>
                <ul className="text-xs text-slate-300 list-disc list-inside mt-2 space-y-1">
                  <li>Sudden popping, clicking, or audio cutout during heavy bass notes.</li>
                  <li>Hissing or loss of stereo separation on Channel 1 or 2.</li>
                  <li>Premature auto-power-off after 30-60 seconds.</li>
                </ul>
              </div>
            </div>

            {/* Sweep Buttons */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
              <button
                disabled={sweepActive}
                onClick={() => runBatterySweep('both')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  sweepActive
                    ? 'bg-amber-500/50 text-slate-900 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{sweepActive ? 'Running 20Hz-18kHz Sweep...' : 'Run Full Battery & Driver Sweep'}</span>
              </button>

              <button
                disabled={sweepActive}
                onClick={() => runBatterySweep('1')}
                className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                Test Channel 1 Only
              </button>

              <button
                disabled={sweepActive}
                onClick={() => runBatterySweep('2')}
                className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                Test Channel 2 Only
              </button>
            </div>

            {sweepActive && (
              <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-lg text-xs text-amber-300 flex items-center gap-2 animate-pulse">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>
                  Sweeping 20 Hz (deep sub-bass) up to 18 kHz. Listen for any driver crackle, distortion, or power dropout!
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Hardware Specs & Troubleshooting */}
      {activeTab === 'diagnostics' && (
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Tech Specs */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                <span>Hardware Specifications</span>
              </h4>
              <dl className="text-xs space-y-2 font-mono">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <dt className="text-slate-400">Transmission Tech:</dt>
                  <dd className="text-slate-200 font-semibold">Dual-Carrier Infrared (IR)</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <dt className="text-slate-400">Channel 1 Carriers:</dt>
                  <dd className="text-sky-400">L: 2.3 MHz / R: 2.8 MHz</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <dt className="text-slate-400">Channel 2 Carriers:</dt>
                  <dd className="text-purple-400">L: 3.2 MHz / R: 3.8 MHz</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <dt className="text-slate-400">Battery Type:</dt>
                  <dd className="text-slate-200">2x AAA (1.5V Alkaline)</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <dt className="text-slate-400">Battery Life:</dt>
                  <dd className="text-slate-200">~40-60 Hours continuous</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <dt className="text-slate-400">Auto Power-Off:</dt>
                  <dd className="text-amber-300">Shuts down after 2 mins idle</dd>
                </div>
              </dl>
            </div>

            {/* Troubleshooting Checklist */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Troubleshooting Quick Checklist</span>
              </h4>
              <ul className="text-xs text-slate-300 space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="text-sky-400 font-bold">•</span>
                  <span><strong>Power LED Red Light:</strong> Press the power button. If the red light does not illuminate, replace both AAA batteries and check that +/- terminals are facing the right way.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-400 font-bold">•</span>
                  <span><strong>Line of Sight to Transmitter:</strong> Because IR travels like light, make sure the translucent plastic dome around the earcups has an unobstructed view of the car's overhead screen transmitter.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-400 font-bold">•</span>
                  <span><strong>Volume Thumbwheel:</strong> Rotate the analog volume wheel on the bottom of the earcup towards max to confirm it is not turned down to zero.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-400 font-bold">•</span>
                  <span><strong>Direct Sunlight Interference:</strong> Strong direct sunlight hitting the IR receiver window can wash out the 2.3MHz carrier wave. Shield the earcups to test.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
