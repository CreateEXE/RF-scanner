import React, { useState, useEffect } from 'react';
import {
  Activity,
  Headphones,
  Sliders,
  Volume2,
  HelpCircle,
  Radio,
  Play,
  Square,
  Sparkles,
  Info,
} from 'lucide-react';
import { audioEngine, AudioEngineMetrics } from './services/audioEngine';
import {
  FREQUENCY_BANDS,
  FrequencyBand,
  VisualizerMode,
  AudioSourceType,
} from './types/audio';
import { VisualizerCanvas } from './components/VisualizerCanvas';
import { BandSelector } from './components/BandSelector';
import { ThresholdControl } from './components/ThresholdControl';
import { AudioSourceSelector } from './components/AudioSourceSelector';
import { VisualizerControls } from './components/VisualizerControls';
import { UconnectHub } from './components/UconnectHub';
import { ConnectionWizardModal } from './components/ConnectionWizardModal';

export default function App() {
  // Visualizer State
  const [mode, setMode] = useState<VisualizerMode>('bars');
  const [selectedBand, setSelectedBand] = useState<FrequencyBand>(FREQUENCY_BANDS[0]); // Full spectrum
  const [thresholdDb, setThresholdDb] = useState<number>(-24);
  const [highlightColor, setHighlightColor] = useState<string>('#ef4444');
  const [sensitivity, setSensitivity] = useState<number>(1.2);

  // Audio Engine Metrics
  const [metrics, setMetrics] = useState<AudioEngineMetrics>({
    currentDb: -100,
    peakDb: -100,
    isThresholdBreached: false,
    activeFrequency: 0,
  });

  const [breachCount, setBreachCount] = useState<number>(0);
  const lastBreachedRef = React.useRef<boolean>(false);

  // Source & Navigation State
  const [currentSource, setCurrentSource] = useState<AudioSourceType>('generator');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showWizard, setShowWizard] = useState<boolean>(false);

  // Update threshold in engine
  useEffect(() => {
    audioEngine.setThreshold(thresholdDb);
  }, [thresholdDb]);

  // Hook into audio engine metrics
  useEffect(() => {
    audioEngine.onMetrics((m) => {
      setMetrics(m);
      if (m.isThresholdBreached && !lastBreachedRef.current) {
        setBreachCount((prev) => prev + 1);
      }
      lastBreachedRef.current = m.isThresholdBreached;
    });
  }, []);

  const handleUpdateCustomBand = (minHz: number, maxHz: number) => {
    setSelectedBand({
      id: 'custom',
      label: 'Custom Band',
      minHz,
      maxHz,
      description: `User defined range: ${minHz} Hz to ${maxHz >= 1000 ? `${(maxHz / 1000).toFixed(1)} kHz` : `${maxHz} Hz`}`,
      color: '#f59e0b',
    });
  };

  const handleToggleEngine = async () => {
    if (isRunning) {
      audioEngine.stop();
      setIsRunning(false);
    } else {
      if (currentSource === 'mic') {
        const ok = await audioEngine.startMicrophone();
        if (ok) setIsRunning(true);
      } else if (currentSource === 'demo') {
        await audioEngine.startDemoTrack();
        setIsRunning(true);
      } else {
        await audioEngine.startGenerator();
        setIsRunning(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-12 selection:bg-sky-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-slate-950 shadow-md shadow-sky-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                  VOID Frequency Visualizer
                </h1>
                <span className="text-[10px] bg-sky-500/10 text-sky-400 font-mono font-semibold px-2 py-0.5 rounded-full border border-sky-500/30">
                  Uconnect® Edition
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Real-Time FFT Spectrum Analyzer & 2-Channel RF/IR Headphone Engine
              </p>
            </div>
          </div>

          {/* Quick Actions in Navbar */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowWizard(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-sky-500 text-xs font-medium transition-all"
            >
              <HelpCircle className="w-4 h-4 text-sky-400" />
              <span>How to Connect</span>
            </button>

            <button
              onClick={handleToggleEngine}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                isRunning
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/20'
              }`}
            >
              {isRunning ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Engine</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Engine</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
        {/* Banner Alert for Headphone Users */}
        <div className="bg-gradient-to-r from-sky-950/60 via-slate-900 to-slate-900 border border-sky-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-300">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Using Uconnect 2-Channel Wireless Headphones?
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Your headphones use <strong>Infrared (IR) carriers</strong> with the <strong>1/2 switch</strong>. They don't use Bluetooth pairing. Click to view quick connection steps!
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowWizard(true)}
            className="px-3.5 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-semibold whitespace-nowrap transition-colors"
          >
            Open Connection Guide
          </button>
        </div>

        {/* Real-Time Visualizer Canvas Section */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Live Canvas Spectrum & Oscilloscope
              </h2>
            </div>

            {/* Quick Metrics HUD */}
            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                <span className="text-slate-400 mr-1.5">SIGNAL:</span>
                <span className="font-bold text-sky-400">
                  {metrics.currentDb > -90 ? `${metrics.currentDb} dBFS` : 'SILENT'}
                </span>
              </div>
              <div className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                <span className="text-slate-400 mr-1.5">PEAK FREQ:</span>
                <span className="font-bold text-amber-400">
                  {metrics.activeFrequency >= 1000
                    ? `${(metrics.activeFrequency / 1000).toFixed(1)} kHz`
                    : `${metrics.activeFrequency} Hz`}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive HTML5 Canvas */}
          <VisualizerCanvas
            mode={mode}
            selectedBand={selectedBand}
            thresholdDb={thresholdDb}
            isBreached={metrics.isThresholdBreached}
            highlightColor={highlightColor}
            sensitivity={sensitivity}
          />

          {/* View Mode & Sensitivity Selector Bar */}
          <VisualizerControls
            mode={mode}
            onModeChange={setMode}
            sensitivity={sensitivity}
            onSensitivityChange={setSensitivity}
          />
        </section>

        {/* Dual Control Section: Threshold Trigger & Frequency Band Focus */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Decibel Threshold Trigger Control */}
          <ThresholdControl
            thresholdDb={thresholdDb}
            currentDb={metrics.currentDb}
            peakDb={metrics.peakDb}
            isBreached={metrics.isThresholdBreached}
            onThresholdChange={setThresholdDb}
            highlightColor={highlightColor}
            onHighlightColorChange={setHighlightColor}
            breachCount={breachCount}
            onResetBreachCount={() => setBreachCount(0)}
          />

          {/* Frequency Band Selector (Dropdown & Sliders) */}
          <BandSelector
            selectedBand={selectedBand}
            onSelectBand={setSelectedBand}
            onUpdateCustomBand={handleUpdateCustomBand}
          />
        </div>

        {/* Audio Input Source Selector */}
        <AudioSourceSelector
          currentSource={currentSource}
          isRunning={isRunning}
          onSourceChange={(source) => {
            setCurrentSource(source);
            setIsRunning(true);
          }}
        />

        {/* Uconnect 2-Channel Headphone Hub & Signal Routing Panel */}
        <section className="pt-2">
          <UconnectHub />
        </section>
      </main>

      {/* Connection Wizard Modal */}
      <ConnectionWizardModal
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
      />
    </div>
  );
}
