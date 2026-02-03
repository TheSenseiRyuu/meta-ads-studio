import React, { useEffect, useState } from 'react';
import { Loader2, Sparkles, Target, Wand2, Layers } from 'lucide-react';

interface LoadingProps {
  status: string;
  step: number;
  hints?: string[];
}

const Loading: React.FC<LoadingProps> = ({ status, step, hints = [] }) => {
  const [currentHintIndex, setCurrentHintIndex] = useState(0);

  useEffect(() => {
    if (hints.length > 0) {
      const interval = setInterval(() => {
        setCurrentHintIndex((prev) => (prev + 1) % hints.length);
      }, 2800);
      return () => clearInterval(interval);
    }
  }, [hints]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-4xl mx-auto mt-8 min-h-[320px] overflow-hidden rounded-3xl bg-zinc-900/60 border border-zinc-700/60 shadow-2xl backdrop-blur-md">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),_transparent_60%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(14,116,144,0.2),_transparent_65%)]"></div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-28 h-28 rounded-full bg-emerald-500/10 blur-2xl animate-pulse"></div>
          <div className="w-20 h-20 rounded-2xl border border-emerald-400/40 bg-zinc-950/70 flex items-center justify-center shadow-lg">
            <Sparkles className="w-8 h-8 text-emerald-300 animate-pulse" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-emerald-200">
          {step === 1 && <Target className="w-4 h-4 animate-spin" />}
          {step === 2 && <Wand2 className="w-4 h-4 animate-pulse" />}
          {step >= 3 && <Layers className="w-4 h-4 animate-bounce" />}
          <span>{status}</span>
        </div>

        <div className="min-h-[80px] flex items-center justify-center px-6 text-center">
          {hints.length > 0 ? (
            <p className="text-base md:text-lg text-zinc-100 font-display">
              {hints[currentHintIndex]}
            </p>
          ) : (
            <div className="flex items-center gap-2 text-zinc-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Warming the creative engines...</span>
            </div>
          )}
        </div>

        <div className="w-72 h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 transition-all duration-700"
            style={{ width: `${step * 20 + 20}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
