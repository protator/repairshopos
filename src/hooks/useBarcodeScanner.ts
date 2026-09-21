import { useEffect, useRef } from 'react';

interface UseBarcodeScannerOptions {
  onScan: (barcode: string) => void;
  minChars?: number;
  maxInterKeyDelayMs?: number;
  playSound?: boolean;
}

// Generates a subtle synthesized positive confirmation beep using Web Audio API
export function playScanBeep() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, ctx.currentTime); // High pitch A6 crisp POS beep
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch {
    // Ignore audio context autoplay restrictions
  }
}

export function useBarcodeScanner({
  onScan,
  minChars = 4,
  maxInterKeyDelayMs = 60,
  playSound = true,
}: UseBarcodeScannerOptions) {
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events with modifiers (Ctrl, Alt, Meta)
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // Reset buffer if delay between keystrokes exceeds max threshold,
      // UNLESS buffer starts with our ticket prefix 'TK-'
      if (timeDiff > maxInterKeyDelayMs && !bufferRef.current.startsWith('TK-')) {
        bufferRef.current = '';
      }

      if (e.key === 'Enter') {
        const candidate = bufferRef.current.trim();
        if (candidate.length >= minChars) {
          // If active element is a form input but the candidate is a barcode scan
          const isBarcodePattern = candidate.startsWith('TK-') || /^[A-Z0-9-]{4,24}$/.test(candidate);
          if (isBarcodePattern) {
            e.preventDefault();
            if (playSound) playScanBeep();
            onScan(candidate);
          }
        }
        bufferRef.current = '';
        return;
      }

      // Record standard printable characters
      if (e.key.length === 1) {
        bufferRef.current += e.key;

        // Auto-prune buffer if it grows unusually long without Enter
        if (bufferRef.current.length > 50) {
          bufferRef.current = bufferRef.current.slice(-25);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onScan, minChars, maxInterKeyDelayMs, playSound]);
}
