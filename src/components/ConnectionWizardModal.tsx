import React, { useState } from 'react';
import {
  X,
  Radio,
  Car,
  Home,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Volume2,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface ConnectionWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectionWizardModal: React.FC<ConnectionWizardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState<'intro' | 'location' | 'incar' | 'athome'>('intro');
  const [selectedChannel, setSelectedChannel] = useState<'1' | '2'>('1');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                How to Connect Uconnect® 1/2 Wireless Headphones
              </h3>
              <p className="text-xs text-slate-400">
                Official Step-by-Step Guide for AAA-Battery IR Headphones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-300">
          {/* STEP 1: The "Why they don't pair" mystery explained */}
          {step === 'intro' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-200 text-sm">
                    Why your phone’s Bluetooth menu won’t find them:
                  </h4>
                  <p className="text-xs text-amber-300/90 leading-relaxed">
                    These Uconnect headphones <strong>do not have Bluetooth or Wi-Fi</strong>. They don't have a pairing code or discovery mode! They are <strong>Optical Infrared (IR) receivers</strong> (similar to how a TV remote works, but beaming high-speed sound waves through invisible light).
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                <h5 className="font-semibold text-slate-100 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-sky-400" />
                  <span>How they actually work:</span>
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  1. You press the <strong>Power button</strong> (red LED turns on).
                  <br />
                  2. The headphones immediately look for invisible <strong>Infrared light signals</strong> coming from a vehicle overhead screen or an IR transmitter box.
                  <br />
                  3. If you flip the switch to <strong>1</strong>, it listens to Frequency Carrier 1. If you flip it to <strong>2</strong>, it listens to Frequency Carrier 2.
                  <br />
                  4. As soon as the transmitter turns on, sound plays instantly. <strong>No pairing needed!</strong>
                </p>
              </div>

              <div className="pt-2">
                <p className="font-medium text-slate-200 text-xs mb-3">
                  Where are you trying to use these headphones right now?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setStep('incar')}
                    className="p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-sky-500 text-left transition-all group flex flex-col justify-between space-y-2"
                  >
                    <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                      <Car className="w-5 h-5" />
                      <span>In My Vehicle (Car / Van)</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Inside Chrysler Town & Country, Pacifica, Dodge Caravan, Durango, or Jeep with roof screens.
                    </p>
                    <span className="text-[11px] text-sky-400 font-medium flex items-center gap-1 pt-1">
                      View Car Connection Steps <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>

                  <button
                    onClick={() => setStep('athome')}
                    className="p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-purple-500 text-left transition-all group flex flex-col justify-between space-y-2"
                  >
                    <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                      <Home className="w-5 h-5" />
                      <span>At Home / With My Phone</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Outside the vehicle (at home, on desk, with phone, laptop, or TV).
                    </p>
                    <span className="text-[11px] text-purple-400 font-medium flex items-center gap-1 pt-1">
                      View Portable Steps <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2A: In-Car Setup */}
          {step === 'incar' && (
            <div className="space-y-4">
              <button
                onClick={() => setStep('intro')}
                className="text-xs text-sky-400 hover:underline flex items-center gap-1 font-medium"
              >
                ← Back to overview
              </button>

              <div className="flex items-center gap-2 pb-1 border-b border-slate-800">
                <Car className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-slate-100 text-sm">
                  Connecting Inside Your Vehicle (3 Easy Steps)
                </h4>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <strong className="text-slate-100 text-xs block">Turn on Car Ignition & Overhead Screen</strong>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Turn the vehicle ignition to RUN or ACC. Fold down the overhead ceiling DVD/Blu-ray screen or power on the rear headrest screens. Look closely at the screen frame: you will see dark glossy red acrylic. That is the IR optical transmitter!
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <strong className="text-slate-100 text-xs block">Route Your Phone Audio to Rear Entertainment</strong>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Connect your phone to the car radio via <strong>Bluetooth</strong> or <strong>Aux/USB</strong>. On your front Uconnect radio touchscreen, tap <strong>Media / VES (Rear Seat)</strong> and select your phone as the audio source for <em>Rear Screen 1</em> (or Screen 2).
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <strong className="text-slate-100 text-xs block">Power On Headphone & Set 1/2 Switch</strong>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Press the power button on the headphones (red LED lights up). Flip the switch to <strong>1</strong> (matches Screen 1) or <strong>2</strong> (matches Screen 2). Turn the volume wheel on the bottom of the earcup up. Sound will flow immediately!
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Tip:</strong> If you hear nothing, try flipping the 1/2 switch back and forth once to ensure the internal slide contact engages.
                </span>
              </div>
            </div>
          )}

          {/* STEP 2B: At-Home Setup */}
          {step === 'athome' && (
            <div className="space-y-4">
              <button
                onClick={() => setStep('intro')}
                className="text-xs text-purple-400 hover:underline flex items-center gap-1 font-medium"
              >
                ← Back to overview
              </button>

              <div className="flex items-center gap-2 pb-1 border-b border-slate-800">
                <Home className="w-5 h-5 text-purple-400" />
                <h4 className="font-bold text-slate-100 text-sm">
                  Connecting At Home / With Phone (Without the Car)
                </h4>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Because these headphones rely on high-frequency Infrared light (2.3MHz & 3.2MHz), a smartphone cannot beam sound to them through thin air by itself. Here are your options:
              </p>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-sky-500/30 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 shrink-0">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <strong className="text-slate-100 text-xs block">
                      Option A: Use a $15 Universal 3.5mm IR Audio Transmitter
                    </strong>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      You can purchase a universal <strong>2-Channel Automotive IR Transmitter</strong> (search Amazon or eBay for "Universal 2-channel IR transmitter for car headphones", brands like XO Vision, Soundstream, or Pyle).
                    </p>
                    <ul className="text-xs text-slate-300 list-disc list-inside pt-1 space-y-0.5">
                      <li>Plug the 3.5mm aux cable into your phone or PC.</li>
                      <li>Power the box with USB or a 12V wall plug.</li>
                      <li>Point it towards your desk: your Uconnect headphones will pick up your phone audio instantly on Channel 1 or 2!</li>
                    </ul>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 shrink-0">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <strong className="text-slate-100 text-xs block">
                      Option B: Use Our In-App 2-Channel Test Router
                    </strong>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      While connected to your car or IR box, use this application's <strong>Channel 1 / 2 Audio Router</strong> tab to test both channels, send separate tones to Channel 1 vs 2, and test if your AAA batteries have enough voltage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            Uconnect® 68239987AB / 05064037AA Compatible
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors"
          >
            Got it, Let's Test!
          </button>
        </div>
      </div>
    </div>
  );
};
