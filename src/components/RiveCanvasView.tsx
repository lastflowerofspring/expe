import React, { useEffect } from 'react';
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';
import { RiveFileSource } from '../types';

interface RiveCanvasViewProps {
  source: RiveFileSource;
  artboard?: string;
  fitMode: Fit;
  alignmentMode: Alignment;
  onRiveLoaded: (rive: any) => void;
  onError: (errorMsg: string) => void;
}

export const RiveCanvasView: React.FC<RiveCanvasViewProps> = ({
  source,
  artboard,
  fitMode,
  alignmentMode,
  onRiveLoaded,
  onError,
}) => {
  // Initialize Rive with artboard (if chosen). We do NOT pass stateMachines hardcoded in initial
  // options, because if a file does not have that exact State Machine name, Rive throws:
  // "State Machine with name ... not found". Instead, we inspect rive.stateMachineNames
  // and rive.animationNames on load and play safely.
  const riveParams = {
    src: source.buffer ? undefined : source.url,
    buffer: source.buffer,
    artboard: artboard,
    autoplay: true,
    layout: new Layout({
      fit: fitMode,
      alignment: alignmentMode,
    }),
    onLoadError: (err: any) => {
      const msg = typeof err === 'string'
        ? err
        : err?.data || err?.message || 'Failed to load or parse Rive file';
      onError(msg);
    },
  };

  const { rive, RiveComponent } = useRive(riveParams, {
    shouldResizeCanvasToContainer: true,
  });

  useEffect(() => {
    if (rive) {
      onRiveLoaded(rive);
    }
  }, [rive, onRiveLoaded]);

  return <RiveComponent className="w-full h-full cursor-pointer select-none" />;
};
