/**
 * CS2 Assistant - C4 Bomb Beep Audio Pitch Detector
 * File: src/core/bomb-timer/c4-audio-pitch-detector.ts
 *
 * Implements audio acoustic frequency detection for CS2 C4 beeps:
 * - Bombsite A: High-pitch fundamental tone (~950 Hz - 1100 Hz, center ~1000 Hz)
 * - Bombsite B: Low-pitch / distorted dual-harmonic tone (~680 Hz - 860 Hz, center ~780 Hz)
 *
 * 100% VAC-safe: Analyzes desktop loopback audio or microphone without touching game memory.
 */

export interface PitchDetectionResult {
  site: 'A' | 'B';
  confidence: number;
  peakFrequencyHz: number;
  secondaryPeakHz?: number;
}

export class C4AudioPitchDetector {
  // CS2 C4 Beep Acoustic Frequency Constants (in Hertz)
  public static readonly SITE_A_MIN_HZ = 920;
  public static readonly SITE_A_MAX_HZ = 1180;
  public static readonly SITE_A_TARGET_HZ = 1000;

  public static readonly SITE_B_MIN_HZ = 660;
  public static readonly SITE_B_MAX_HZ = 880;
  public static readonly SITE_B_TARGET_HZ = 780;

  /**
   * Analyzes an array of FFT frequency bins and magnitudes to determine if the beep
   * matches Bombsite A (~1000 Hz) or Bombsite B (~780 Hz).
   */
  public static detectFromFrequencies(
    frequencies: number[],
    magnitudes: number[]
  ): PitchDetectionResult | null {
    if (frequencies.length === 0 || magnitudes.length === 0 || frequencies.length !== magnitudes.length) {
      return null;
    }

    // Find peak magnitude in the relevant C4 audio spectrum (500 Hz to 1300 Hz)
    let maxMag = -Infinity;
    let peakFreq = 0;

    for (let i = 0; i < frequencies.length; i++) {
      const f = frequencies[i];
      const m = magnitudes[i];
      if (f >= 500 && f <= 1300 && m > maxMag) {
        maxMag = m;
        peakFreq = f;
      }
    }

    if (maxMag <= 0 || peakFreq === 0) {
      return null;
    }

    // Evaluate Site A match
    const distA = Math.abs(peakFreq - this.SITE_A_TARGET_HZ);
    const inRangeA = peakFreq >= this.SITE_A_MIN_HZ && peakFreq <= this.SITE_A_MAX_HZ;

    // Evaluate Site B match
    const distB = Math.abs(peakFreq - this.SITE_B_TARGET_HZ);
    const inRangeB = peakFreq >= this.SITE_B_MIN_HZ && peakFreq <= this.SITE_B_MAX_HZ;

    if (inRangeA && (!inRangeB || distA <= distB)) {
      const confidence = Math.max(0.6, 1.0 - distA / (this.SITE_A_MAX_HZ - this.SITE_A_MIN_HZ));
      return {
        site: 'A',
        confidence: Number(confidence.toFixed(2)),
        peakFrequencyHz: Math.round(peakFreq),
      };
    }

    if (inRangeB) {
      const confidence = Math.max(0.6, 1.0 - distB / (this.SITE_B_MAX_HZ - this.SITE_B_MIN_HZ));
      return {
        site: 'B',
        confidence: Number(confidence.toFixed(2)),
        peakFrequencyHz: Math.round(peakFreq),
      };
    }

    // Fallback: assign closest target if within expanded tolerance
    if (distA < distB && distA < 200) {
      return { site: 'A', confidence: 0.65, peakFrequencyHz: Math.round(peakFreq) };
    }
    if (distB < distA && distB < 200) {
      return { site: 'B', confidence: 0.65, peakFrequencyHz: Math.round(peakFreq) };
    }

    return null;
  }

  /**
   * Performs an in-memory FFT on raw PCM audio data (e.g. from AudioContext or WASAPI loopback)
   * and detects whether the dominant beep pitch matches Bombsite A or B.
   */
  public static detectFromPcmData(
    pcmData: Float32Array,
    sampleRate: number = 44100
  ): PitchDetectionResult | null {
    if (!pcmData || pcmData.length < 512) {
      return null;
    }

    const n = Math.min(2048, pcmData.length);
    const frequencies: number[] = [];
    const magnitudes: number[] = [];

    // Compute magnitude spectrum for frequency bins up to 1500 Hz
    const maxBin = Math.floor((1500 * n) / sampleRate);
    const minBin = Math.floor((400 * n) / sampleRate);

    for (let k = minBin; k <= maxBin; k++) {
      let real = 0;
      let imag = 0;
      const omega = (2 * Math.PI * k) / n;

      for (let t = 0; t < n; t++) {
        // Hann window smoothing
        const window = 0.5 * (1 - Math.cos((2 * Math.PI * t) / (n - 1)));
        const sample = pcmData[t] * window;
        real += sample * Math.cos(omega * t);
        imag -= sample * Math.sin(omega * t);
      }

      const freqHz = (k * sampleRate) / n;
      const mag = Math.sqrt(real * real + imag * imag);
      frequencies.push(freqHz);
      magnitudes.push(mag);
    }

    return this.detectFromFrequencies(frequencies, magnitudes);
  }

  /**
   * In a browser/Electron renderer environment, opens a short audio listener
   * (over 1.8 seconds) to capture the first C4 beep and resolve the site.
   */
  public static listenAndIdentifySite(
    onResolved: (result: PitchDetectionResult) => void,
    timeoutMs: number = 2200
  ): () => void {
    const g: any = typeof globalThis !== 'undefined' ? globalThis : undefined;
    if (!g || !g.navigator?.mediaDevices?.getUserMedia) {
      return () => {};
    }

    let isCancelled = false;
    let audioCtx: any = null;
    let stream: any = null;

    const cleanup = () => {
      isCancelled = true;
      if (stream) {
        stream.getTracks().forEach((t: any) => t.stop());
        stream = null;
      }
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close().catch(() => {});
        audioCtx = null;
      }
    };

    g.navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((s: any) => {
        if (isCancelled) {
          s.getTracks().forEach((t: any) => t.stop());
          return;
        }
        stream = s;
        audioCtx = new (g.AudioContext || g.webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);

        const buffer = new Float32Array(analyser.fftSize);
        const interval = setInterval(() => {
          if (isCancelled) {
            clearInterval(interval);
            return;
          }
          analyser.getFloatTimeDomainData(buffer);

          // Check if audio has sufficient energy (beep occurred)
          let rms = 0;
          for (let i = 0; i < buffer.length; i++) {
            rms += buffer[i] * buffer[i];
          }
          rms = Math.sqrt(rms / buffer.length);

          if (rms > 0.015) {
            const detected = C4AudioPitchDetector.detectFromPcmData(buffer, audioCtx?.sampleRate || 44100);
            if (detected) {
              clearInterval(interval);
              cleanup();
              onResolved(detected);
            }
          }
        }, 80);

        setTimeout(() => {
          clearInterval(interval);
          cleanup();
        }, timeoutMs);
      })
      .catch(() => {
        // Fall back gracefully if audio permission is not granted
      });

    return cleanup;
  }
}
