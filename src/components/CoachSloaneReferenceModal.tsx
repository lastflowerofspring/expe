import React, { useState } from 'react';
import { BookOpen, X, Copy, Check, Info, Sparkles, Layers, Cpu, Music } from 'lucide-react';
import { COACH_SLOANE_SCHEMA } from '../data/coachSloaneRiveSchema';

interface CoachSloaneReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoachSloaneReferenceModal: React.FC<CoachSloaneReferenceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const schemaJson = JSON.stringify(COACH_SLOANE_SCHEMA, null, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl text-neutral-100 overflow-hidden"
        role="dialog"
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Coach Sloane Rive Architecture & Animation Reference
              </h2>
              <p className="text-xs text-neutral-400">
                Memorized specification for `nothing.riv` and `nothing-G.riv`
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Architecture Concept */}
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4">
            <h3 className="font-semibold text-emerald-300 flex items-center gap-2 mb-1.5 text-sm">
              <Sparkles className="w-4 h-4" /> Core Animation Principle: Multi-Layer Flow
            </h3>
            <p className="text-neutral-300 text-xs leading-relaxed">
              Coach Sloane operates on an additive multi-layer animation architecture. The base skeleton, breathing cycles, head micro-movements, and eye blinks are driven by the continuous State Machine{' '}
              <code className="text-emerald-400 bg-black/40 px-1.5 py-0.5 rounded font-mono">autoIdle</code>.
              Facial expressions (<code className="text-emerald-400 bg-black/40 px-1 py-0.5 rounded font-mono">happy</code>, <code className="text-emerald-400 bg-black/40 px-1 py-0.5 rounded font-mono">sad</code>, etc.) and lipsync visemes (<code className="text-emerald-400 bg-black/40 px-1 py-0.5 rounded font-mono">visemeA–X</code>) layer on top of <code className="text-emerald-400 bg-black/40 px-1 py-0.5 rounded font-mono">autoIdle</code> without calling <code className="text-red-400 bg-black/40 px-1 py-0.5 rounded font-mono">stop()</code> on the base rig.
            </p>
          </div>

          {/* Section 1: Expressions (11) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                1. Expressions (11 Total)
              </h3>
              <span className="text-xs text-neutral-500">11 linear animations</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {COACH_SLOANE_SCHEMA.expressions.map(exp => (
                <div
                  key={exp.name}
                  className="bg-neutral-800/60 border border-neutral-700/60 rounded-xl p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-white text-xs px-2 py-0.5 bg-neutral-900 rounded border border-neutral-700">
                      {exp.name}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-medium">
                      {exp.phonemeOrEmotion}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-snug">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Triggers & Switches */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Triggers */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2 mb-3">
                <Cpu className="w-4 h-4 text-amber-400" />
                2. Triggers (2 Total)
              </h3>
              <div className="space-y-2">
                {COACH_SLOANE_SCHEMA.triggers.map(trig => (
                  <div
                    key={trig.name}
                    className="bg-neutral-800/60 border border-neutral-700/60 rounded-xl p-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-white text-xs px-2 py-0.5 bg-neutral-900 rounded border border-neutral-700">
                        {trig.name}
                      </span>
                      <span className="text-[11px] text-amber-400">{trig.phonemeOrEmotion}</span>
                    </div>
                    <p className="text-xs text-neutral-300">{trig.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Switches */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2 mb-3">
                <Cpu className="w-4 h-4 text-emerald-400" />
                3. Switches (State Machines)
              </h3>
              <div className="space-y-2">
                {COACH_SLOANE_SCHEMA.switches.map(sw => (
                  <div
                    key={sw.name}
                    className="bg-neutral-800/60 border border-emerald-500/40 rounded-xl p-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-emerald-300 text-xs px-2 py-0.5 bg-emerald-950/60 rounded border border-emerald-500/40">
                        {sw.name}
                      </span>
                      <span className="text-[11px] text-emerald-400 font-semibold">
                        State Machine
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300">{sw.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Visemes (Lipsync) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <Music className="w-4 h-4 text-purple-400" />
                4. Visemes (Speech Lipsync Phonemes - 9 Total)
              </h3>
              <span className="text-xs text-neutral-500">Mouth shapes A through X</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {COACH_SLOANE_SCHEMA.visemes.map(vis => (
                <div
                  key={vis.name}
                  className="bg-neutral-800/60 border border-neutral-700/60 rounded-xl p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-purple-300 text-xs px-2 py-0.5 bg-neutral-900 rounded border border-purple-800/60">
                      {vis.name}
                    </span>
                    <span className="text-[11px] text-purple-400 font-mono">
                      {vis.phonemeOrEmotion}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-snug">{vis.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* JSON Export for developer reference */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-neutral-400">
                JSON Structure Schema (Ready for Code Integration)
              </span>
              <button
                onClick={() => copyToClipboard(schemaJson, 'schema-json')}
                className="text-xs px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedSection === 'schema-json' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy JSON Schema
                  </>
                )}
              </button>
            </div>
            <pre className="text-[11px] font-mono text-neutral-400 max-h-48 overflow-y-auto bg-black/40 p-3 rounded-lg border border-neutral-800/60">
              {schemaJson}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Reference
          </button>
        </div>
      </div>
    </div>
  );
};
