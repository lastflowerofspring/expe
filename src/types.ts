export interface RiveFileSource {
  id: string;
  name: string;
  type: 'upload' | 'url' | 'sample';
  url: string;
  buffer?: ArrayBuffer;
  size?: number;
}

export interface RiveFileInfo {
  fileName: string;
  artboardNames: string[];
  animationNames: string[];
  stateMachineNames: string[];
  activeArtboard?: string;
  activeAnimation?: string;
  activeStateMachine?: string;
}
