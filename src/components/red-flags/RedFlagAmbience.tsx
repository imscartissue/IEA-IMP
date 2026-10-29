import { useEffect, useRef, useState } from "react";

type RedFlagAmbienceProps = {
  onDark?: boolean;
};

/**
 * A quiet, optional ambient drone for red-flag pages.
 * Audio starts only after a visitor activates the control.
 */
export function RedFlagAmbience({ onDark = false }: RedFlagAmbienceProps) {
  const [enabled, setEnabled] = useState(false);
  const contextRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);

  useEffect(
    () => () => {
      const context = contextRef.current;
      if (!context) return;
      oscillatorsRef.current.forEach((oscillator) => {
        try {
          oscillator.stop();
        } catch {
          // The oscillator may already have stopped.
        }
      });
      void context.close();
    },
    [],
  );

  async function toggleAmbience() {
    const activeContext = contextRef.current;
    if (activeContext) {
      const master = masterRef.current;
      if (master) {
        master.gain.cancelScheduledValues(activeContext.currentTime);
        master.gain.setTargetAtTime(0, activeContext.currentTime, 0.12);
      }
      const voices = oscillatorsRef.current;
      contextRef.current = null;
      masterRef.current = null;
      oscillatorsRef.current = [];
      window.setTimeout(() => {
        voices.forEach((oscillator) => {
          try {
            oscillator.stop();
          } catch {
            // The oscillator may already have stopped.
          }
        });
        void activeContext.close();
      }, 500);
      setEnabled(false);
      return;
    }

    try {
      const context = new window.AudioContext();
      await context.resume();

      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(360, context.currentTime);

      const master = context.createGain();
      master.gain.setValueAtTime(0, context.currentTime);
      master.gain.setTargetAtTime(0.028, context.currentTime, 0.8);
      filter.connect(master);
      master.connect(context.destination);

      const voices: OscillatorNode[] = [];
      [55, 55.7, 82.4, 110].forEach((frequency) => {
        const oscillator = context.createOscillator();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, context.currentTime);
        oscillator.connect(filter);
        oscillator.start();
        voices.push(oscillator);
      });

      const drift = context.createOscillator();
      drift.frequency.setValueAtTime(0.07, context.currentTime);
      const driftDepth = context.createGain();
      driftDepth.gain.setValueAtTime(90, context.currentTime);
      drift.connect(driftDepth);
      driftDepth.connect(filter.frequency);
      drift.start();
      voices.push(drift);

      contextRef.current = context;
      masterRef.current = master;
      oscillatorsRef.current = voices;
      setEnabled(true);
    } catch {
      setEnabled(false);
    }
  }

  const buttonColor = onDark
    ? "border-gold/40 bg-black/20 text-ink-inverse hover:bg-black/35"
    : "border-claret/30 bg-surface text-ink hover:bg-bronze-wash";

  return (
    <button
      type="button"
      aria-pressed={enabled}
      onClick={() => void toggleAmbience()}
      className={`type-caption inline-flex items-center gap-2 self-start rounded-sm border px-3 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze ${buttonColor}`}
      title={enabled ? "Turn off eerie ambience" : "Play optional eerie ambience"}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 10v4h3l4 3V7l-4 3H4Z" />
        {enabled ? (
          <>
            <path d="M15 9a5 5 0 0 1 0 6" />
            <path d="M17.5 6a9 9 0 0 1 0 12" />
          </>
        ) : (
          <path d="m16 9 5 6m0-6-5 6" />
        )}
      </svg>
      <span>{enabled ? "Turn ambience off" : "Enable eerie ambience"}</span>
    </button>
  );
}
