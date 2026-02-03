import React from 'react';
import { StrategyBoard, QualityAssurance } from '../types';
import { Sparkles, Target, ShieldAlert } from 'lucide-react';

interface InsightBoardProps {
  strategy: StrategyBoard | null;
  qa: QualityAssurance | null;
}

export const InsightBoard: React.FC<InsightBoardProps> = ({ strategy, qa }) => {
  if (!strategy) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 text-zinc-500">
        <p className="text-sm">La stratégie s'affichera ici après génération.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Strategy</p>
          <h3 className="text-lg font-display text-white">Creative direction</h3>
        </div>
        <Sparkles className="w-5 h-5 text-emerald-300" />
      </div>

      <div className="space-y-4 text-sm text-zinc-200">
        <div>
          <p className="text-zinc-400 text-xs uppercase tracking-[0.3em]">Positioning</p>
          <p className="mt-2">{strategy.positioning}</p>
        </div>
        <div>
          <p className="text-zinc-400 text-xs uppercase tracking-[0.3em]">Core promise</p>
          <p className="mt-2">{strategy.corePromise}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-zinc-400 text-xs uppercase tracking-[0.3em]">Insights</p>
            <ul className="mt-2 space-y-2">
              {strategy.audienceInsights.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-zinc-400 text-xs uppercase tracking-[0.3em]">Angles</p>
            <ul className="mt-2 space-y-2">
              {strategy.angles.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-zinc-400 text-xs uppercase tracking-[0.3em]">Hooks</p>
            <ul className="mt-2 space-y-2">
              {strategy.hooks.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mt-2"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-zinc-400 text-xs uppercase tracking-[0.3em]">Creative directions</p>
            <ul className="mt-2 space-y-2">
              {strategy.creativeDirections.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 mt-2"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-zinc-400 text-xs uppercase tracking-[0.3em]">Do</p>
            <ul className="mt-2 space-y-2">
              {strategy.do.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mt-2"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-zinc-400 text-xs uppercase tracking-[0.3em]">Don't</p>
            <ul className="mt-2 space-y-2">
              {strategy.dont.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400 mt-2"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {qa && (
          <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="flex items-center gap-2 text-amber-200 mb-2 text-xs uppercase tracking-[0.3em]">
              <ShieldAlert className="w-4 h-4" />
              Points de vigilance
            </div>
            <ul className="space-y-2 text-amber-100 text-sm">
              {qa.policyRisks.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
