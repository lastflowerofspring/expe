import React, { useState, useRef } from 'react';
import {
  Upload,
  FileCode,
  Sparkles,
  ExternalLink,
  Sun,
  Moon,
  Grid,
  Palette,
  CheckCircle2,
  FolderOpen,
  HelpCircle,
  Info,
  Layers,
  Split,
} from 'lucide-react';
import { RiveFileSource } from './types';
import { RivePlayer } from './components/RivePlayer';
import { ModelCloningLab } from './components/ModelCloningLab';

const SAMPLE_FILES: RiveFileSource[] = [
  {
    id: 'sample-nothing-exp',
    name: 'Coach Sloane - Expressions (nothing.riv)',
    type: 'sample',
    url: '/samples/nothing.riv',
  },
  {
    id: 'sample-nothing-light',
    name: 'Coach Sloane - Light (nothing-G.riv)',
    type: 'sample',
    url: '/samples/nothing-G.riv',
  },
  {
    id: 'sample-vehicles',
    name: 'Vehicles Interactive Demo',
    type: 'sample',
    url: '/samples/vehicles.riv',
  },
  {
    id: 'sample-skills',
    name: 'Skills Tree Demo',
    type: 'sample',
    url: '/samples/skills.riv',
  },
  {
    id: 'sample-truck',
    name: 'Truck Rig Demo',
    type: 'sample',
    url: '/samples/truck.riv',
  },
];

export default function App() {
  const [activeSource, setActiveSource] = useState<RiveFileSource>(SAMPLE_FILES[0]);
  const [bgTheme, setBgTheme] = useState<'grid' | 'dark' | 'light' | 'warm'>('grid');
  const [activeTopTab, setActiveTopTab] = useState<'player' | 'cloning'>('cloning');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [customPathInput, setCustomPathInput] = useState<string>('');
  const [customPathError, setCustomPathError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.riv')) {
      alert('Please upload a .riv file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const buffer = e.target?.result as ArrayBuffer;
      const newSource: RiveFileSource = {
        id: `upload-${Date.now()}`,
        name: file.name,
        type: 'upload',
        url: URL.createObjectURL(file),
        buffer,
        size: file.size,
      };
      setActiveSource(newSource);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleCustomPathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPath = customPathInput.trim();
    if (!cleanPath) return;

    const formattedUrl = cleanPath.startsWith('/') || cleanPath.startsWith('http')
      ? cleanPath
      : `/${cleanPath}`;

    setActiveSource({
      id: `custom-${Date.now()}`,
      name: cleanPath.split('/').pop() || 'custom.riv',
      type: 'url',
      url: formattedUrl,
    });
    setCustomPathError(null);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-150">
      {/* Header Bar */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-neutral-900 dark:text-white">
                  Rive Animation Viewer
                </h1>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                  .riv engine active
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Interactive runtime canvas & state machine inspector
              </p>
            </div>
          </div>

          {/* Top Level Mode Tabs */}
          <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-2xl border border-neutral-200/80 dark:border-neutral-700">
            <button
              id="nav-tab-cloning-studio"
              onClick={() => setActiveTopTab('cloning')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTopTab === 'cloning'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1:1 Cloning Studio</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-neutral-950 text-amber-300">
                1:1 RIG
              </span>
            </button>
            <button
              id="nav-tab-rive-player"
              onClick={() => setActiveTopTab('player')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTopTab === 'player'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-500" />
              <span>Rive Player & Inspector</span>
            </button>
          </div>

          {/* Canvas Background Selector */}
          <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl border border-neutral-200/80 dark:border-neutral-700">
            <button
              onClick={() => setBgTheme('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                bgTheme === 'grid'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
              title="Grid background"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setBgTheme('dark')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                bgTheme === 'dark'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
              title="Dark background"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setBgTheme('light')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                bgTheme === 'light'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
              title="White background"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setBgTheme('warm')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                bgTheme === 'warm'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
              title="Warm paper background"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full flex flex-col gap-8">
        {activeTopTab === 'cloning' ? (
          /* 1:1 Model Cloning Studio View */
          <ModelCloningLab />
        ) : (
          /* Standard Rive Player & Inspector View */
          <>
            {/* Upload Bar & Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-150 ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-4 ring-indigo-500/10'
                  : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 bg-white dark:bg-neutral-900'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".riv"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />

              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                  Drop your <span className="text-indigo-600 dark:text-indigo-400">.riv</span> file here, or browse from computer
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md">
                  Loads directly in your browser memory for immediate live interactive preview with state machine and mouse interactions.
                </p>
              </div>
            </div>

            {/* Quick Load Presets & Path Option */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
              {/* Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mr-1">
                  Sample .riv:
                </span>
                {SAMPLE_FILES.map(sample => (
                  <button
                    key={sample.id}
                    onClick={() => setActiveSource(sample)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                      activeSource.id === sample.id
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {sample.name}
                  </button>
                ))}
              </div>

              {/* Load from /public or URL */}
              <form onSubmit={handleCustomPathSubmit} className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. /my-file.riv or https://..."
                    value={customPathInput}
                    onChange={e => setCustomPathInput(e.target.value)}
                    className="text-xs px-3 py-1.5 w-60 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="text-xs px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 font-medium transition-colors cursor-pointer"
                >
                  Load URL/Path
                </button>
              </form>
            </div>

            {/* Active Player */}
            <RivePlayer source={activeSource} bgTheme={bgTheme} />

            {/* Upload Status & Guide Card */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-neutral-500" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Where to place your .riv files
                </h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-800">
                  <span className="font-semibold text-neutral-900 dark:text-white block mb-1">
                    1. Immediate Testing (In App)
                  </span>
                  Use the drag-and-drop box above. Any <code className="bg-neutral-200 dark:bg-neutral-700 px-1 py-0.5 rounded">.riv</code> file dropped there plays instantly in the canvas using WebAssembly.
                </div>
                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-800">
                  <span className="font-semibold text-neutral-900 dark:text-white block mb-1">
                    2. Permanent Project Files (In Workspace)
                  </span>
                  In the AI Studio file explorer on the left, upload your file into the <code className="bg-neutral-200 dark:bg-neutral-700 px-1 py-0.5 rounded">public/</code> folder (e.g. <code className="bg-neutral-200 dark:bg-neutral-700 px-1 py-0.5 rounded">public/animation.riv</code>), then type <code className="bg-neutral-200 dark:bg-neutral-700 px-1 py-0.5 rounded">/animation.riv</code> into the Load path box!
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
