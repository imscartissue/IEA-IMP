import { useCallback, useEffect, useRef, useState } from "react";

type RedFlagAmbienceProps = {
  onDark?: boolean;
};

/**
 * Atmospheric sound for red-flag pages. It attempts to start on entry; if the
 * browser blocks autoplay, the visible control lets the visitor enable it.
 */
export function RedFlagAmbience({ onDark = false }: RedFlagAmbienceProps) {
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const contextRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);

  const startAmbience = useCallback(async () => {
    let context = contextRef.current;

    if (!context || context.state === "closed") {
      try {
        context = new window.AudioContext();
        contextRef.current = context;

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
          const oscillator = context!.createOscillator();
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(frequency, context!.currentTime);
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

        masterRef.current = master;
        oscillatorsRef.current = voices;
      } catch {
        setBlocked(true);
        return;
      }
    }

    try {
      if (context.state !== "running") await context.resume();
      if (contextRef.current !== context) return;
      const active = context.state === "running";
      setPlaying(active);
      setBlocked(!active);
    } catch {
      setPlaying(false);
      setBlocked(true);
    }
  }, []);

  const stopAmbience = useCallback(() => {
    const context = contextRef.current;
    if (!context) {
      setPlaying(false);
      return;
    }

    const master = masterRef.current;
    if (master) {
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setTargetAtTime(0, context.currentTime, 0.12);
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
      void context.close();
    }, 500);
    setPlaying(false);
    setBlocked(false);
  }, []);

  useEffect(() => {
    void startAmbience();
    return () => {
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
    };
  }, [startAmbience]);

  const buttonColor = onDark
    ? "border-gold/40 bg-black/20 text-ink-inverse hover:bg-black/35"
    : "border-claret/30 bg-surface text-ink hover:bg-bronze-wash";

  return (
    <button
      type="button"
      aria-pressed={playing}
      onClick={() => (playing ? stopAmbience() : void startAmbience())}
      className={`type-caption inline-flex items-center gap-2 self-start rounded-sm border px-3 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze ${buttonColor}`}
      title={playing ? "Turn off eerie ambience" : "Enable eerie ambience"}
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
        {playing ? (
          <>
            <path d="M15 9a5 5 0 0 1 0 6" />
            <path d="M17.5 6a9 9 0 0 1 0 12" />
          </>
        ) : (
          <path d="m16 9 5 6m0-6-5 6" />
        )}
      </svg>
      <span>{playing ? "Mute ambience" : blocked ? "Tap to enable sound" : "Eerie ambience"}</span>
    </button>
  );
}
