import React, { useEffect, useRef } from 'react';
import { FrequencyBand, VisualizerMode } from '../types/audio';
import { audioEngine } from '../services/audioEngine';

interface VisualizerCanvasProps {
  mode: VisualizerMode;
  selectedBand: FrequencyBand;
  thresholdDb: number;
  isBreached: boolean;
  highlightColor?: string;
  normalColor?: string;
  sensitivity?: number; // 1 to 3
}

export const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({
  mode,
  selectedBand,
  thresholdDb,
  isBreached,
  highlightColor = '#ef4444', // Red-500
  normalColor = '#0ea5e9', // Sky-500
  sensitivity = 1.2,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const peaksRef = useRef<number[]>([]);
  const historyRef = useRef<ImageData | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const handleResize = () => {
      if (containerRef.current && canvas) {
        const dpr = window.devicePixelRatio || 1;
        const rect = containerRef.current.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      const analyser = audioEngine.getAnalyser();
      const rect = containerRef.current?.getBoundingClientRect();
      const width = rect?.width || 800;
      const height = rect?.height || 360;

      // Clear Canvas
      ctx.fillStyle = '#020617'; // slate-950
      ctx.fillRect(0, 0, width, height);

      // Draw subtle background grid
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#0f172a';
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      for (let x = 0; x < width; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // If audio is inactive, draw idle wave
      if (!analyser || !audioEngine.isActive()) {
        ctx.beginPath();
        ctx.strokeStyle = isBreached ? highlightColor : '#334155';
        ctx.lineWidth = 2;
        const midY = height / 2;
        for (let x = 0; x < width; x += 4) {
          const y = midY + Math.sin(x * 0.02 + Date.now() * 0.002) * 4;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = '13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('AUDIO INACTIVE • TAP START ENGINE OR ACTIVATE MICROPHONE', width / 2, height / 2 + 30);

        animId = requestAnimationFrame(render);
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const freqData = new Uint8Array(bufferLength);
      const timeData = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(freqData);
      analyser.getByteTimeDomainData(timeData);

      const audioCtx = audioEngine.getContext();
      const sampleRate = audioCtx?.sampleRate || 44100;
      const nyquist = sampleRate / 2;

      // Calculate frequency indices for the chosen band
      const minBin = Math.max(0, Math.floor((selectedBand.minHz / nyquist) * bufferLength));
      const maxBin = Math.min(bufferLength - 1, Math.ceil((selectedBand.maxHz / nyquist) * bufferLength));
      const bandBinCount = Math.max(1, maxBin - minBin);

      // Map dB threshold to a relative horizontal line on the canvas
      // Analyser range is -90 dB to -10 dB -> 0 to height
      const minDb = analyser.minDecibels;
      const maxDb = analyser.maxDecibels;
      const thresholdRatio = Math.max(0, Math.min(1, (thresholdDb - minDb) / (maxDb - minDb)));
      const thresholdY = height - thresholdRatio * height;

      // Active color changes depending on threshold breach!
      const activePrimary = isBreached ? highlightColor : normalColor;
      const activeSecondary = isBreached ? '#fbbf24' : '#38bdf8'; // Amber-400 or Sky-400

      // Render based on visualizer mode
      switch (mode) {
        case 'bars': {
          const barCount = Math.min(96, width > 600 ? 64 : 36);
          const barWidth = (width / barCount) * 0.75;
          const barGap = (width / barCount) * 0.25;

          if (peaksRef.current.length !== barCount) {
            peaksRef.current = new Array(barCount).fill(0);
          }

          for (let i = 0; i < barCount; i++) {
            const binStart = minBin + Math.floor((i / barCount) * bandBinCount);
            const binEnd = minBin + Math.floor(((i + 1) / barCount) * bandBinCount);
            let sum = 0;
            let count = 0;
            for (let b = binStart; b <= binEnd && b < bufferLength; b++) {
              sum += freqData[b];
              count++;
            }
            const avgVal = count > 0 ? (sum / count) * sensitivity : 0;
            const barHeight = Math.min(height - 10, (avgVal / 255) * (height - 30));

            const x = i * (barWidth + barGap) + barGap / 2;
            const y = height - barHeight;

            // Peak hold decay
            if (barHeight > peaksRef.current[i]) {
              peaksRef.current[i] = barHeight;
            } else {
              peaksRef.current[i] = Math.max(0, peaksRef.current[i] - 1.5);
            }

            // Draw Bar Gradient
            const grad = ctx.createLinearGradient(0, height, 0, y);
            if (isBreached) {
              grad.addColorStop(0, '#991b1b'); // Dark red
              grad.addColorStop(0.5, '#ef4444'); // Neon red
              grad.addColorStop(1, '#fde047'); // Yellow warning cap
            } else {
              grad.addColorStop(0, '#0369a1'); // Deep sky blue
              grad.addColorStop(0.5, selectedBand.color); // Band color
              grad.addColorStop(1, '#a5f3fc'); // Cyan highlight
            }

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
            ctx.fill();

            // Draw floating peak cap
            const peakY = height - peaksRef.current[i];
            ctx.fillStyle = isBreached ? '#fef08a' : '#ffffff';
            ctx.fillRect(x, Math.max(4, peakY - 3), barWidth, 2);
          }
          break;
        }

        case 'curve': {
          ctx.beginPath();
          ctx.moveTo(0, height);

          const step = Math.max(2, Math.floor(width / 120));
          for (let x = 0; x <= width; x += step) {
            const binIdx = minBin + Math.floor((x / width) * bandBinCount);
            const val = (freqData[binIdx] || 0) * sensitivity;
            const y = height - (val / 255) * (height - 20);
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, height);
          ctx.closePath();

          const grad = ctx.createLinearGradient(0, 0, 0, height);
          if (isBreached) {
            grad.addColorStop(0, 'rgba(239, 68, 68, 0.7)');
            grad.addColorStop(0.7, 'rgba(185, 28, 28, 0.25)');
            grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
          } else {
            grad.addColorStop(0, 'rgba(14, 165, 233, 0.6)');
            grad.addColorStop(0.7, 'rgba(6, 182, 212, 0.15)');
            grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
          }

          ctx.fillStyle = grad;
          ctx.fill();

          ctx.strokeStyle = activePrimary;
          ctx.lineWidth = 2.5;
          ctx.stroke();
          break;
        }

        case 'wave': {
          ctx.beginPath();
          ctx.lineWidth = isBreached ? 3 : 2;
          ctx.strokeStyle = activePrimary;

          const sliceWidth = width / bufferLength;
          let x = 0;
          for (let i = 0; i < bufferLength; i++) {
            const v = timeData[i] / 128.0;
            const y = (v * height) / 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            x += sliceWidth;
          }
          ctx.stroke();

          // Second harmonic ghost trace
          ctx.beginPath();
          ctx.lineWidth = 1;
          ctx.strokeStyle = isBreached ? 'rgba(251, 191, 36, 0.4)' : 'rgba(56, 189, 248, 0.3)';
          x = 0;
          for (let i = 0; i < bufferLength; i += 2) {
            const v = (timeData[i] - 128) * 1.5 + 128;
            const y = ((v / 128.0) * height) / 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            x += sliceWidth * 2;
          }
          ctx.stroke();
          break;
        }

        case 'radial': {
          const centerX = width / 2;
          const centerY = height / 2;
          const baseRadius = Math.min(width, height) * 0.22;
          const points = 72;

          ctx.beginPath();
          for (let i = 0; i < points; i++) {
            const binIdx = minBin + Math.floor((i / points) * bandBinCount);
            const val = (freqData[binIdx] || 0) * sensitivity;
            const r = baseRadius + (val / 255) * (baseRadius * 1.2);
            const angle = (i / points) * Math.PI * 2;
            const px = centerX + Math.cos(angle) * r;
            const py = centerY + Math.sin(angle) * r;

            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();

          ctx.strokeStyle = activePrimary;
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.fillStyle = isBreached ? 'rgba(239, 68, 68, 0.15)' : 'rgba(14, 165, 233, 0.1)';
          ctx.fill();

          // Center pulsing core
          ctx.beginPath();
          ctx.arc(centerX, centerY, baseRadius * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = isBreached ? '#ef4444' : '#0284c7';
          ctx.fill();
          break;
        }

        case 'spectrogram': {
          // Fast line spectrogram
          const sliceH = height / 32;
          for (let i = 0; i < 32; i++) {
            const binIdx = minBin + Math.floor((i / 32) * bandBinCount);
            const val = freqData[binIdx] || 0;
            const y = height - (i + 1) * sliceH;
            const hue = isBreached ? (val > 150 ? 0 : 35) : Math.floor(190 + (val / 255) * 80);
            ctx.fillStyle = `hsl(${hue}, 90%, ${Math.max(10, Math.min(70, (val / 255) * 80))}%)`;
            ctx.fillRect(0, y, width, sliceH - 1);
          }
          break;
        }
      }

      // Draw Decibel Threshold Reference Line across the canvas
      ctx.beginPath();
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = isBreached ? '#f87171' : '#94a3b8';
      ctx.lineWidth = isBreached ? 2 : 1;
      ctx.moveTo(0, thresholdY);
      ctx.lineTo(width, thresholdY);
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // Draw Threshold Label on the right
      ctx.fillStyle = isBreached ? '#fca5a5' : '#cbd5e1';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`THRESHOLD: ${thresholdDb} dBFS`, width - 12, Math.max(16, thresholdY - 6));

      // Draw Focus Band Tag on top-left
      ctx.fillStyle = selectedBand.color;
      ctx.font = '11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(
        `BAND: ${selectedBand.label.toUpperCase()} [${selectedBand.minHz}Hz - ${selectedBand.maxHz >= 1000 ? `${selectedBand.maxHz / 1000}kHz` : `${selectedBand.maxHz}Hz`}]`,
        14,
        22
      );

      // If threshold is breached, draw flashing alert overlay / vignette
      if (isBreached) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, width - 4, height - 4);

        // Alert watermark badge
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(width / 2 - 80, 10, 160, 24);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⚠ THRESHOLD EXCEEDED', width / 2, 26);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [mode, selectedBand, thresholdDb, isBreached, highlightColor, normalColor, sensitivity]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[320px] md:h-[400px] rounded-2xl overflow-hidden border transition-all duration-200 shadow-2xl ${
        isBreached
          ? 'border-red-500 shadow-red-500/20 ring-2 ring-red-500/30'
          : 'border-slate-800 shadow-slate-950/50'
      }`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
