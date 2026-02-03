import React, { useEffect, useState } from 'react';
import { Play, Layers, Sparkles } from 'lucide-react';

interface IntroScreenProps {
  onComplete: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      onComplete();
      return;
    }

    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 1400),
      setTimeout(() => onComplete(), 1800),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center overflow-hidden font-display"
      onClick={onComplete}
    >
      <style>{`
        @keyframes orbit {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.2; transform: scale(0.9); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
      `}</style>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.2),_transparent_55%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(14,116,144,0.25),_transparent_60%)]"></div>

      <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
        <div
          className={`absolute inset-0 rounded-full border border-emerald-400/20 transition-all duration-1000 ${
            phase >= 2 ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
          }`}
        ></div>
        <div
          className={`absolute inset-0 rounded-full border border-dashed border-emerald-300/30 transition-all duration-1000 ${
            phase >= 2 ? 'scale-0 opacity-0' : 'scale-110 opacity-80'
          }`}
        ></div>

        <div
          className={`absolute w-32 h-32 md:w-40 md:h-40 rounded-3xl border border-emerald-400/40 bg-zinc-900/70 backdrop-blur-xl flex items-center justify-center transition-all duration-1000 ${
            phase >= 2 ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
          }`}
        >
          <div className="absolute inset-0 bg-emerald-500/10 blur-2xl animate-[glowPulse_3s_ease-in-out_infinite]"></div>
          <Layers className="w-12 h-12 text-emerald-300" />
        </div>

        <div
          className={`absolute inset-0 transition-all duration-1000 ${
            phase >= 2 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-emerald-300/50"
              style={{
                transform: `translate(-50%, -50%) rotate(${i * 30}deg) translate(120px)`,
              }}
            >
              <div
                className="absolute top-1/2 left-1/2 w-10 h-[1px] bg-emerald-300/20"
                style={{
                  transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                }}
              ></div>
            </div>
          ))}
          <div className="absolute top-1/2 left-1/2 w-56 h-56 border border-emerald-300/10 rounded-full animate-[orbit_12s_linear_infinite]"></div>
        </div>
      </div>

      <div
        className={`absolute bottom-16 md:bottom-20 flex flex-col items-center transition-all duration-1000 ${
          phase === 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight text-center">
          Meta Ads <span className="text-emerald-400">Studio</span>
        </h1>
        <p className="text-zinc-400 text-xs md:text-sm uppercase tracking-[0.3em] mb-6">
          Brief to high-performing ads in minutes
        </p>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onComplete();
          }}
          className="group relative px-8 py-3 bg-transparent overflow-hidden rounded-full"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-20 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-0 border border-emerald-400/40 rounded-full group-hover:border-emerald-300 transition-colors"></div>
          <div className="relative flex items-center gap-3">
            <Play className="w-4 h-4 text-emerald-200" />
            <span className="text-emerald-200 group-hover:text-white font-bold tracking-widest text-sm transition-colors">
              ENTER STUDIO
            </span>
            <Sparkles className="w-4 h-4 text-emerald-200" />
          </div>
        </button>
      </div>

      <button
        onClick={(event) => {
          event.stopPropagation();
          onComplete();
        }}
        className="absolute top-6 right-6 text-xs uppercase tracking-[0.3em] text-zinc-400 hover:text-white border border-zinc-800 rounded-full px-3 py-1 bg-zinc-900/60"
      >
        Skip
      </button>
    </div>
  );
};

export default IntroScreen;
