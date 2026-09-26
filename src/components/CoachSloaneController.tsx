import React, { useState } from 'react';
import { Sparkles, Activity, Volume2, ShieldCheck, Check } from 'lucide-react';
import { COACH_SLOANE_SCHEMA, ExpressionMeta } from '../data/coachSloaneRiveSchema';

interface CoachSloaneControllerProps {
  onPlayAnimation: (name: string, category: 'expression' | 'trigger' | 'viseme') => void;
  onToggleSwitch: (switchName: string, active: boolean) => void;
  activeSwitches: Record<string, boolean>;
  activeAnimation: string | null;
  lastTriggeredName: string | null;
  tapCount: number;
  availableStateMachines?: string[];
  availableAnimations?: string[];
}

export const CoachSloaneController: React.FC<CoachSloaneControllerProps> = ({
  onPlayAnimation,
  onToggleSwitch,
  activeSwitches,
  activeAnimation,
  lastTriggeredName,
  tapCount,
  availableStateMachines = [],
  availableAnimations = [],
}) => {
  const [tappedItem, setTappedItem] = useState<string | null>(null);

  const handleTap = (item: ExpressionMeta, category: 'expression' | 'trigger' | 'viseme') => {
    setTappedItem(item.name);
    onPlayAnimation(item.name, category);
    setTimeout(() => {
      setTappedItem(prev => (prev === item.name ? null : prev));
    }, 280);
  };

  const isSwitchOn = (name: string) => Boolean(activeSwitches[name]);

  return (
    <div
      id="coach-sloane-controls-panel"
      className="w-full bg-[#18181b] text-neutral-200 rounded-2xl p-5 border border-neutral-800 shadow-xl select-none"
    >
      {/* 1. EXPRESSIONS Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold tracking-widest uppercase text-neutral-400">
            EXPRESSIONS
          </span>
          <span className="text-[10px] text-neutral-500 font-medium">
            Tap to play • Preserves natural flow
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {COACH_SLOANE_SCHEMA.expressions.map(exp => {
            const isTapped = tappedItem === exp.name;
            const isCurrentlyActive = activeAnimation === exp.name;
            return (
              <button
                key={exp.name}
                id={`btn-exp-${exp.name}`}
                onClick={() => handleTap(exp, 'expression')}
                title={`${exp.label}: ${exp.description}`}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-100 flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  isTapped
                    ? 'bg-neutral-700 text-white ring-2 ring-emerald-400 shadow-lg scale-95'
                    : isCurrentlyActive
                    ? 'bg-neutral-800 text-emerald-300 border border-emerald-500/60 shadow-xs'
                    : 'bg-[#27272a] hover:bg-[#323236] text-neutral-200 border border-neutral-700/60 hover:border-neutral-600'
                }`}
              >
                {exp.label}
                {isCurrentlyActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. TRIGGERS Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold tracking-widest uppercase text-neutral-400">
            TRIGGERS
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {COACH_SLOANE_SCHEMA.triggers.map(trig => {
            const isTapped = tappedItem === trig.name;
            const isCurrentlyActive = activeAnimation === trig.name;
            return (
              <button
                key={trig.name}
                id={`btn-trig-${trig.name}`}
                onClick={() => handleTap(trig, 'trigger')}
                title={`${trig.label}: ${trig.description}`}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-100 flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  isTapped
                    ? 'bg-neutral-700 text-white ring-2 ring-emerald-400 shadow-lg scale-95'
                    : isCurrentlyActive
                    ? 'bg-neutral-800 text-emerald-300 border border-emerald-500/60 shadow-xs'
                    : 'bg-[#27272a] hover:bg-[#323236] text-neutral-200 border border-neutral-700/60 hover:border-neutral-600'
                }`}
              >
                {trig.label}
                {isCurrentlyActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. VISEMES Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold tracking-widest uppercase text-neutral-400">
            VISEMES
          </span>
          <span className="text-[10px] text-neutral-500 font-medium">
            Speech mouth phonemes (A–X)
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {COACH_SLOANE_SCHEMA.visemes.map(vis => {
            const isTapped = tappedItem === vis.name;
            const isCurrentlyActive = activeAnimation === vis.name;
            return (
              <button
                key={vis.name}
                id={`btn-vis-${vis.name}`}
                onClick={() => handleTap(vis, 'viseme')}
                title={`${vis.label} (${vis.phonemeOrEmotion}): ${vis.description}`}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-100 flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  isTapped
                    ? 'bg-neutral-700 text-white ring-2 ring-emerald-400 shadow-lg scale-95'
                    : isCurrentlyActive
                    ? 'bg-neutral-800 text-emerald-300 border border-emerald-500/60 shadow-xs'
                    : 'bg-[#27272a] hover:bg-[#323236] text-neutral-200 border border-neutral-700/60 hover:border-neutral-600'
                }`}
              >
                {vis.label}
                {isCurrentlyActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. SWITCHES Section */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold tracking-widest uppercase text-neutral-400">
            SWITCHES
          </span>
          <span className="text-[10px] text-emerald-400/90 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
            autoIdle keeps posture & breathing active
          </span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {COACH_SLOANE_SCHEMA.switches.map(sw => {
            const isAvailable =
              availableStateMachines.length === 0 ||
              availableStateMachines.includes(sw.name);
            const active = isSwitchOn(sw.name) && isAvailable;

            return (
              <button
                key={sw.name}
                id={`btn-switch-${sw.name}`}
                disabled={!isAvailable}
                onClick={() => onToggleSwitch(sw.name, !active)}
                title={
                  !isAvailable
                    ? `${sw.label} is not present in this file`
                    : `${sw.label}: ${sw.description}`
                }
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                  !isAvailable
                    ? 'opacity-40 cursor-not-allowed bg-neutral-900 border border-neutral-800 text-neutral-500'
                    : active
                    ? 'bg-[#18231c] text-[#4ade80] border-2 border-[#4ade80] shadow-sm shadow-[#4ade80]/20 cursor-pointer'
                    : 'bg-[#27272a] hover:bg-[#323236] text-neutral-400 border border-neutral-700/70 hover:border-neutral-600 cursor-pointer'
                }`}
              >
                <span>{sw.label}</span>
                {active && (
                  <span className="w-2 h-2 rounded-full bg-[#4ade80]" />
                )}
                {!isAvailable && (
                  <span className="text-[10px] text-neutral-500 font-mono">(N/A)</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Status & Memorized Architecture Notice */}
      <div className="mt-5 pt-3.5 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {lastTriggeredName ? (
              <>
                Playing: <strong className="text-neutral-200">{lastTriggeredName}</strong> (Tap #{tapCount})
              </>
            ) : (
              <span>Ready • Tap any button above</span>
            )}
          </span>
        </div>
        <div className="text-[11px] text-neutral-400 font-mono">
          State: {isSwitchOn('autoIdle') ? 'autoIdle ACTIVE (Normal Flow)' : 'PAUSED'}
        </div>
      </div>
    </div>
  );
};
