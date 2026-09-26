import React, { useState, useEffect, useCallback } from 'react';
import { Fit, Alignment } from '@rive-app/react-canvas';
import {
  Play,
  Pause,
  RotateCcw,
  Layers,
  Sliders,
  Zap,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  BookOpen,
  LayoutGrid,
} from 'lucide-react';
import { RiveFileSource } from '../types';
import { RiveCanvasView } from './RiveCanvasView';
import { CoachSloaneController } from './CoachSloaneController';
import { CoachSloaneReferenceModal } from './CoachSloaneReferenceModal';
import { ModelCloningLab } from './ModelCloningLab';

interface RivePlayerProps {
  source: RiveFileSource;
  bgTheme: 'dark' | 'light' | 'grid' | 'warm';
}

interface SMInputControl {
  name: string;
  type: number; // 56: Number, 58: Trigger, 59: Boolean
  value: any;
  ref: any;
}

export const RivePlayer: React.FC<RivePlayerProps> = ({ source, bgTheme }) => {
  const [activeRive, setActiveRive] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [artboards, setArtboards] = useState<string[]>([]);
  const [animations, setAnimations] = useState<string[]>([]);
  const [stateMachines, setStateMachines] = useState<string[]>([]);
  const [selectedArtboard, setSelectedArtboard] = useState<string | undefined>(undefined);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'sm' | 'anim' | 'default'>('default');
  const [smInputs, setSmInputs] = useState<SMInputControl[]>([]);
  const [fitMode, setFitMode] = useState<Fit>(Fit.Contain);
  const [alignmentMode, setAlignmentMode] = useState<Alignment>(Alignment.Center);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Coach Sloane specific state & switches
  const [activeSwitches, setActiveSwitches] = useState<Record<string, boolean>>({
    autoIdle: true,
    lipsync: false,
  });
  const [lastTriggeredName, setLastTriggeredName] = useState<string | null>(null);
  const [tapCount, setTapCount] = useState<number>(0);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'controller' | 'inspector' | 'cloningLab'>('controller');

  const isCoachSloane =
    source.url?.includes('nothing') ||
    source.name?.toLowerCase().includes('sloane') ||
    animations.includes('happy') ||
    animations.includes('visemeA') ||
    stateMachines.includes('autoIdle');

  // When source changes, reset states
  useEffect(() => {
    setActiveRive(null);
    setSelectedArtboard(undefined);
    setActiveItem(null);
    setActiveType('default');
    setArtboards([]);
    setAnimations([]);
    setStateMachines([]);
    setSmInputs([]);
    setLoadError(null);
    setIsPlaying(true);
    setLastTriggeredName(null);
    setTapCount(0);
    setActiveSwitches({ autoIdle: true, lipsync: false });
  }, [source.id]);

  // Handler when Rive runtime finishes loading the canvas
  const handleRiveLoaded = useCallback((rive: any) => {
    setActiveRive(rive);
    setLoadError(null);

    try {
      // 1. Gather all artboards across the file
      let abList: string[] = [];
      if (rive.contents && Array.isArray(rive.contents.artboards)) {
        abList = rive.contents.artboards.map((ab: any) => ab.name || String(ab));
      } else if (rive.artboardNames && Array.isArray(rive.artboardNames)) {
        abList = rive.artboardNames;
      }
      if (abList.length === 0 && rive.activeArtboard) {
        abList = [rive.activeArtboard];
      }
      setArtboards(abList);

      // 2. Gather animations and state machines for the currently loaded artboard
      const anims: string[] = rive.animationNames || [];
      const sms: string[] = rive.stateMachineNames || [];
      setAnimations(anims);
      setStateMachines(sms);

      // 3. For Coach Sloane models: start the autoIdle State Machine so the natural flow
      // (body posture, breathing, blinking) runs continuously!
      if (sms.includes('autoIdle')) {
        rive.play('autoIdle');
        setActiveItem('autoIdle');
        setActiveType('sm');
        loadStateMachineInputs(rive, 'autoIdle');
      } else if (sms.length > 0) {
        rive.play(sms[0]);
        setActiveItem(sms[0]);
        setActiveType('sm');
        loadStateMachineInputs(rive, sms[0]);
      } else if (anims.length > 0) {
        rive.play(anims[0]);
        setActiveItem(anims[0]);
        setActiveType('anim');
      }
    } catch (err) {
      console.warn('Error reading Rive contents:', err);
    }
  }, []);

  const loadStateMachineInputs = (rive: any, smName: string) => {
    try {
      const rawInputs = rive.stateMachineInputs(smName) || [];
      const mapped: SMInputControl[] = rawInputs.map((input: any) => ({
        name: input.name,
        type: input.type,
        value: input.value,
        ref: input,
      }));
      setSmInputs(mapped);
    } catch (e) {
      console.warn('Could not load inputs for state machine:', e);
      setSmInputs([]);
    }
  };

  /**
   * Play an Expression, Trigger, or Viseme without breaking the character flow!
   * - Never stops autoIdle (the active switch)
   * - Clears previous conflicting expressions/visemes so they don't pile up
   * - Immediately restarts from time 0 so every single tap triggers the animation
   */
  const handlePlayExpressionOrTrigger = (
    animName: string,
    category: 'expression' | 'trigger' | 'viseme'
  ) => {
    if (!activeRive) return;

    try {
      const animator = activeRive.animator;
      const instancedAnims: any[] = animator?.animations || [];

      // 1. Clear previous expression/viseme animations so bones don't conflict
      for (const a of instancedAnims) {
        if (a.name !== animName && a.name !== 'autoIdle' && a.name !== 'lipsync') {
          a.playing = false;
          a.time = 0;
        }
      }

      // 2. Play the requested animation and rewind to frame 0
      const targetAnim = instancedAnims.find((a: any) => a.name === animName);
      if (targetAnim) {
        targetAnim.time = 0; // Rewind to start!
        targetAnim.playing = true;
      } else {
        activeRive.play(animName);
      }

      // 3. Ensure the active switches (especially autoIdle) are still playing!
      if (activeSwitches['autoIdle'] && stateMachines.includes('autoIdle')) {
        const playingSmList = activeRive.playingStateMachineNames || [];
        if (!playingSmList.includes('autoIdle')) {
          activeRive.play('autoIdle');
        }
      }

      if (activeSwitches['lipsync'] && stateMachines.includes('lipsync')) {
        const playingSmList = activeRive.playingStateMachineNames || [];
        if (!playingSmList.includes('lipsync')) {
          activeRive.play('lipsync');
        }
      }

      // 4. Force rendering loop if paused
      if (!activeRive.isPlaying) {
        activeRive.startRendering();
      }

      // 5. Update UI feedback
      setLastTriggeredName(animName);
      setTapCount(c => c + 1);
      setActiveItem(animName);
      setActiveType('anim');
      setIsPlaying(true);
    } catch (e) {
      console.warn('Error playing animation:', e);
    }
  };

  /**
   * Toggle background state machines (autoIdle / lipsync)
   */
  const handleToggleSwitch = (switchName: string, active: boolean) => {
    setActiveSwitches(prev => ({ ...prev, [switchName]: active }));

    if (!activeRive) return;
    try {
      if (active) {
        if (stateMachines.includes(switchName)) {
          activeRive.play(switchName);
          if (!activeRive.isPlaying) {
            activeRive.startRendering();
          }
        }
      } else {
        if (stateMachines.includes(switchName)) {
          activeRive.pause(switchName);
        }
      }
    } catch (e) {
      console.warn('Error toggling switch:', e);
    }
  };

  // Generic fallback play handlers for non-Coach Sloane files
  const handlePlayStateMachine = (smName: string) => {
    if (!activeRive) return;
    try {
      activeRive.play(smName);
      setActiveItem(smName);
      setActiveType('sm');
      setIsPlaying(true);
      loadStateMachineInputs(activeRive, smName);
    } catch (e) {
      console.warn('Error playing state machine:', e);
    }
  };

  const handlePlayAnimation = (animName: string) => {
    if (isCoachSloane) {
      handlePlayExpressionOrTrigger(animName, 'expression');
      return;
    }

    if (!activeRive) return;
    try {
      activeRive.play(animName);
      setActiveItem(animName);
      setActiveType('anim');
      setIsPlaying(true);
      setSmInputs([]);
    } catch (e) {
      console.warn('Error playing animation:', e);
    }
  };

  const handlePlayToggle = () => {
    if (!activeRive) return;
    if (isPlaying) {
      activeRive.pause();
      setIsPlaying(false);
    } else {
      activeRive.play();
      setIsPlaying(true);
    }
  };

  const handleReset = () => {
    if (!activeRive) return;
    try {
      activeRive.reset();
      if (stateMachines.includes('autoIdle')) {
        activeRive.play('autoIdle');
      } else if (activeItem) {
        activeRive.play(activeItem);
      } else {
        activeRive.play();
      }
      setIsPlaying(true);
      setLastTriggeredName(null);
    } catch (e) {
      console.warn('Error resetting animation:', e);
    }
  };

  const handleArtboardChange = (abName: string) => {
    if (selectedArtboard === abName) return;
    setSelectedArtboard(abName);
    setActiveItem(null);
    setSmInputs([]);
  };

  const getBgClass = () => {
    switch (bgTheme) {
      case 'dark':
        return 'bg-neutral-900 border-neutral-800';
      case 'light':
        return 'bg-white border-neutral-200';
      case 'warm':
        return 'bg-[#f7f5f0] border-stone-200';
      case 'grid':
      default:
        return 'bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] bg-neutral-950 border-neutral-800';
    }
  };

  const viewKey = `${source.id}-${selectedArtboard || 'default'}`;

  return (
    <div id="rive-player-container" className="flex flex-col xl:flex-row gap-6 w-full">
      {/* Left Column: Canvas Viewport & Quick Controls */}
      <div className="flex-1 flex flex-col items-center min-w-0">
        <div
          id="rive-viewport"
          className={`relative w-full aspect-square max-h-[580px] rounded-2xl border shadow-sm overflow-hidden flex items-center justify-center transition-colors duration-200 ${getBgClass()}`}
        >
          {loadError ? (
            <div className="p-8 text-center max-w-md">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3 font-semibold text-lg">
                !
              </div>
              <h4 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                Unable to Load Rive Animation
              </h4>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                {loadError}
              </p>
            </div>
          ) : (
            <RiveCanvasView
              key={viewKey}
              source={source}
              artboard={selectedArtboard}
              fitMode={fitMode}
              alignmentMode={alignmentMode}
              onRiveLoaded={handleRiveLoaded}
              onError={err => setLoadError(err)}
            />
          )}

          {/* Overlay Status Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-900/85 backdrop-blur-md text-white border border-white/10 shadow-sm">
              <span
                className={`w-2 h-2 rounded-full ${
                  isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              {source.name}
            </span>

            {isCoachSloane && activeSwitches['autoIdle'] && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 backdrop-blur-md shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                autoIdle Flow Active
              </span>
            )}

            {lastTriggeredName && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-indigo-600/90 text-white backdrop-blur-md shadow-xs">
                Expression: {lastTriggeredName}
              </span>
            )}
          </div>
        </div>

        {/* Playback Transport Bar */}
        <div className="mt-4 flex items-center justify-between w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-2 px-3 shadow-xs">
          <div className="flex items-center gap-2">
            <button
              id="btn-toggle-play"
              onClick={handlePlayToggle}
              disabled={!activeRive}
              className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors disabled:opacity-50 cursor-pointer"
              title={isPlaying ? 'Pause Animation' : 'Play Animation'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button
              id="btn-reset-animation"
              onClick={handleReset}
              disabled={!activeRive}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors disabled:opacity-50 cursor-pointer"
              title="Reset Character to Base Flow"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {isCoachSloane && (
              <button
                id="btn-open-reference"
                onClick={() => setIsReferenceModalOpen(true)}
                className="text-xs px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>Memorized Reference</span>
              </button>
            )}

            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
              <span>{isCoachSloane ? 'Normal Flow (Additive)' : 'Standard Rive'}</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isPlaying ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Dedicated Controller or Generic Inspector */}
      <div className="w-full xl:w-[480px] flex flex-col gap-4">
        {isCoachSloane ? (
          <>
            {/* View Mode Switcher */}
            <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 p-1.5 rounded-xl gap-1">
              <button
                onClick={() => setActiveTab('controller')}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'controller'
                    ? 'bg-neutral-800 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Controller</span>
              </button>
              <button
                onClick={() => setActiveTab('cloningLab')}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'cloningLab'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Cloning Lab</span>
              </button>
              <button
                onClick={() => setActiveTab('inspector')}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'inspector'
                    ? 'bg-neutral-800 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Inspector</span>
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'controller' && (
              <CoachSloaneController
                onPlayAnimation={handlePlayExpressionOrTrigger}
                onToggleSwitch={handleToggleSwitch}
                activeSwitches={activeSwitches}
                activeAnimation={lastTriggeredName}
                lastTriggeredName={lastTriggeredName}
                tapCount={tapCount}
                availableStateMachines={stateMachines}
                availableAnimations={animations}
              />
            )}
            {activeTab === 'cloningLab' && (
              <ModelCloningLab />
            )}
            {activeTab === 'inspector' && (
              <GenericInspector
                artboards={artboards}
                selectedArtboard={selectedArtboard}
                handleArtboardChange={handleArtboardChange}
                stateMachines={stateMachines}
                activeItem={activeItem}
                activeType={activeType}
                handlePlayStateMachine={handlePlayStateMachine}
                animations={animations}
                handlePlayAnimation={handlePlayAnimation}
                smInputs={smInputs}
                setSmInputs={setSmInputs}
                fitMode={fitMode}
                setFitMode={setFitMode}
                alignmentMode={alignmentMode}
                setAlignmentMode={setAlignmentMode}
              />
            )}
          </>
        ) : (
          <GenericInspector
            artboards={artboards}
            selectedArtboard={selectedArtboard}
            handleArtboardChange={handleArtboardChange}
            stateMachines={stateMachines}
            activeItem={activeItem}
            activeType={activeType}
            handlePlayStateMachine={handlePlayStateMachine}
            animations={animations}
            handlePlayAnimation={handlePlayAnimation}
            smInputs={smInputs}
            setSmInputs={setSmInputs}
            fitMode={fitMode}
            setFitMode={setFitMode}
            alignmentMode={alignmentMode}
            setAlignmentMode={setAlignmentMode}
          />
        )}
      </div>

      {/* Memorized Architecture & Reference Modal */}
      <CoachSloaneReferenceModal
        isOpen={isReferenceModalOpen}
        onClose={() => setIsReferenceModalOpen(false)}
      />
    </div>
  );
};

// Extracted Inspector sub-component for cleanly viewing artboards, machines, inputs
interface GenericInspectorProps {
  artboards: string[];
  selectedArtboard?: string;
  handleArtboardChange: (ab: string) => void;
  stateMachines: string[];
  activeItem: string | null;
  activeType: string;
  handlePlayStateMachine: (sm: string) => void;
  animations: string[];
  handlePlayAnimation: (anim: string) => void;
  smInputs: SMInputControl[];
  setSmInputs: React.Dispatch<React.SetStateAction<SMInputControl[]>>;
  fitMode: Fit;
  setFitMode: (f: Fit) => void;
  alignmentMode: Alignment;
  setAlignmentMode: (a: Alignment) => void;
}

const GenericInspector: React.FC<GenericInspectorProps> = ({
  artboards,
  selectedArtboard,
  handleArtboardChange,
  stateMachines,
  activeItem,
  activeType,
  handlePlayStateMachine,
  animations,
  handlePlayAnimation,
  smInputs,
  setSmInputs,
  fitMode,
  setFitMode,
  alignmentMode,
  setAlignmentMode,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* File Elements Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <Layers className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Animation Elements
          </h3>
        </div>

        {/* Artboards */}
        {artboards.length > 1 && (
          <div className="mb-4">
            <label className="block text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
              Artboards ({artboards.length})
            </label>
            <div className="flex flex-wrap gap-1.5">
              {artboards.map(ab => (
                <button
                  key={ab}
                  onClick={() => handleArtboardChange(ab)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                    selectedArtboard === ab || (!selectedArtboard && ab === artboards[0])
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {ab}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* State Machines */}
        <div className="mb-4">
          <label className="block text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
            State Machines ({stateMachines.length})
          </label>
          {stateMachines.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {stateMachines.map(sm => (
                <button
                  key={sm}
                  onClick={() => handlePlayStateMachine(sm)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                    activeType === 'sm' && activeItem === sm
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {sm}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-400 italic">No state machines on active artboard</p>
          )}
        </div>

        {/* Linear Animations */}
        <div className="mb-2">
          <label className="block text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
            Linear Animations ({animations.length})
          </label>
          {animations.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
              {animations.map(anim => (
                <button
                  key={anim}
                  onClick={() => handlePlayAnimation(anim)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                    activeType === 'anim' && activeItem === anim
                      ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {anim}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-400 italic">No linear animations</p>
          )}
        </div>
      </div>

      {/* State Machine Inputs (If any) */}
      {smInputs.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-neutral-100 dark:border-neutral-800">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              State Machine Inputs
            </h3>
          </div>
          <div className="space-y-3">
            {smInputs.map(input => {
              if (input.type === 59) {
                return (
                  <div key={input.name} className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      {input.name}
                    </span>
                    <button
                      onClick={() => {
                        input.ref.value = !input.ref.value;
                        setSmInputs([...smInputs]);
                      }}
                      className="text-xs px-2.5 py-1 rounded-md border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
                    >
                      {input.ref.value ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-emerald-500" /> ON
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 text-neutral-400" /> OFF
                        </>
                      )}
                    </button>
                  </div>
                );
              }
              if (input.type === 58) {
                return (
                  <div key={input.name} className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      {input.name}
                    </span>
                    <button
                      onClick={() => input.ref.fire()}
                      className="text-xs px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-xs transition-colors cursor-pointer"
                    >
                      Fire Trigger
                    </button>
                  </div>
                );
              }
              return (
                <div key={input.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    <span>{input.name}</span>
                    <span>{input.ref.value}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={input.ref.value || 0}
                    onChange={e => {
                      input.ref.value = Number(e.target.value);
                      setSmInputs([...smInputs]);
                    }}
                    className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Viewport Settings */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <Sliders className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Display & Layout
          </h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              Canvas Fit
            </label>
            <select
              id="select-fit-mode"
              value={fitMode}
              onChange={e => setFitMode(e.target.value as Fit)}
              className="w-full text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 text-neutral-900 dark:text-neutral-100"
            >
              <option value={Fit.Contain}>Contain (Preserve aspect ratio)</option>
              <option value={Fit.Cover}>Cover (Fill entire container)</option>
              <option value={Fit.Fill}>Fill (Stretch to edges)</option>
              <option value={Fit.FitWidth}>Fit Width</option>
              <option value={Fit.FitHeight}>Fit Height</option>
              <option value={Fit.None}>None (Natural 1:1 pixels)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              Alignment
            </label>
            <select
              id="select-alignment-mode"
              value={alignmentMode}
              onChange={e => setAlignmentMode(e.target.value as Alignment)}
              className="w-full text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 text-neutral-900 dark:text-neutral-100"
            >
              <option value={Alignment.Center}>Center</option>
              <option value={Alignment.TopLeft}>Top Left</option>
              <option value={Alignment.TopCenter}>Top Center</option>
              <option value={Alignment.BottomCenter}>Bottom Center</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
