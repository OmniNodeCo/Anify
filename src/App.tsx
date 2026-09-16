import React, { useState, useRef, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { Viewport } from './components/Viewport';
import { Timeline } from './components/Timeline';
import { ParameterPanel } from './components/ParameterPanel';
import { CodeEditor } from './components/CodeEditor';
import { AIChatDrawer } from './components/AIChatDrawer';
import { AIPromptModal } from './components/AIPromptModal';
import { PresetGallery } from './components/PresetGallery';
import { ExportModal } from './components/ExportModal';
import { AudioModal } from './components/AudioModal';
import { QuickGuideModal } from './components/QuickGuideModal';

import { AnimationProject, AspectRatioType, PostProcessingConfig, AudioConfig, AIChatMessage, PresetAnimation } from './types/animation';
import { AnimationRunnerRef } from './runtime/AnimationRunner';
import { PRESETS } from './presets';
import { generateAnimationFromPrompt } from './ai/generator';
import { processDirectorCommand } from './ai/chatDirector';

import { CharacterStudio } from './character/CharacterStudio';

export function App() {
  // App Mode ('character' = Character Studio Flagship App, 'fx' = Procedural FX Studio)
  const [appMode, setAppMode] = useState<'character' | 'fx'>('character');

  // Active Project (default to Quantum Black Hole masterpiece)
  const initialPreset = PRESETS[0];
  const [project, setProject] = useState<AnimationProject>(() => ({
    id: 'proj_default',
    title: initialPreset.title,
    prompt: initialPreset.prompt,
    description: initialPreset.description,
    engine: initialPreset.engine,
    code: initialPreset.code,
    duration: initialPreset.duration,
    fps: 60,
    aspectRatio: '16:9',
    resolution: { width: 1280, height: 720 },
    parameters: JSON.parse(JSON.stringify(initialPreset.parameters)),
    keyframeTracks: [
      {
        id: 'speed',
        name: 'Master Dynamics',
        targetProperty: 'speed',
        defaultValue: 1.0,
        min: 0.2,
        max: 3.0,
        keyframes: [
          { id: 'k1', time: 0, value: 1.0, easing: 'easeInOutQuad' },
          { id: 'k2', time: initialPreset.duration / 2, value: 1.5, easing: 'easeInOutQuad' },
          { id: 'k3', time: initialPreset.duration, value: 1.0, easing: 'easeInOutQuad' }
        ]
      }
    ],
    postProcessing: {
      bloom: initialPreset.postProcessing?.bloom ?? true,
      bloomIntensity: initialPreset.postProcessing?.bloomIntensity ?? 1.5,
      bloomRadius: initialPreset.postProcessing?.bloomRadius ?? 18,
      chromaticAberration: initialPreset.postProcessing?.chromaticAberration ?? true,
      aberrationAmount: 3,
      motionBlur: false,
      motionBlurDecay: 0.2,
      vignette: initialPreset.postProcessing?.vignette ?? true,
      vignetteDarkness: 0.75,
      scanlines: false,
      grain: false,
      grainIntensity: 0.1
    },
    audio: {
      enabled: false,
      synthPreset: 'synthwave',
      volume: 0.5,
      reactivitySensitivity: 1.5,
      bassImpact: 1.0,
      trebleImpact: 1.0
    },
    tags: initialPreset.tags,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }));

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('16:9');

  // UI Panels & Tabs
  const [activeRightTab, setActiveRightTab] = useState<'params' | 'code'>('params');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Modals
  const [isAIPromptOpen, setIsAIPromptOpen] = useState<boolean>(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isAudioOpen, setIsAudioOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Chat Messages
  const [chatMessages, setChatMessages] = useState<AIChatMessage[]>([
    {
      id: 'm1',
      role: 'assistant',
      content: "Hello! I am your Anify AI Co-Director. Tell me what changes or additions you'd like to make to this animation (e.g. 'make it faster', 'change colors to purple', 'increase particle density', 'add bloom') and I'll adapt it in real-time!",
      timestamp: Date.now()
    }
  ]);
  const [isChatProcessing, setIsChatProcessing] = useState<boolean>(false);

  // Runner Ref
  const runnerRef = useRef<AnimationRunnerRef | null>(null);

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        runnerRef.current?.stepFrame(-1);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        runnerRef.current?.stepFrame(1);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleReset();
      } else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        setIsAIPromptOpen(true);
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setIsGalleryOpen(true);
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        setIsExportOpen(true);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsAudioOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleReset = () => {
    setCurrentTime(0);
    runnerRef.current?.reset();
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    runnerRef.current?.seekTo(time);
  };

  const handleStepFrame = (frames: number) => {
    runnerRef.current?.stepFrame(frames);
  };

  const handleUpdateTitle = (title: string) => {
    setProject((prev) => ({ ...prev, title }));
  };

  const handleUpdateParam = (id: string, value: any) => {
    setProject((prev) => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [id]: {
          ...prev.parameters[id],
          value
        }
      }
    }));
  };

  const handleUpdatePostProcessing = (config: Partial<PostProcessingConfig>) => {
    setProject((prev) => ({
      ...prev,
      postProcessing: {
        ...prev.postProcessing,
        ...config
      }
    }));
  };

  const handleUpdateAudioConfig = (config: Partial<AudioConfig>) => {
    setProject((prev) => ({
      ...prev,
      audio: {
        ...prev.audio,
        ...config
      }
    }));
  };

  const handleResetParams = () => {
    const foundPreset = PRESETS.find((p) => p.title === project.title);
    if (foundPreset) {
      setProject((prev) => ({
        ...prev,
        parameters: JSON.parse(JSON.stringify(foundPreset.parameters))
      }));
    }
  };

  const handleUpdateCode = (code: string) => {
    setProject((prev) => ({ ...prev, code }));
  };

  const handleRecompile = () => {
    runnerRef.current?.reset();
  };

  const handleSelectPreset = (preset: PresetAnimation) => {
    setProject({
      id: 'proj_' + preset.id,
      title: preset.title,
      prompt: preset.prompt,
      description: preset.description,
      engine: preset.engine,
      code: preset.code,
      duration: preset.duration,
      fps: 60,
      aspectRatio,
      resolution: { width: 1280, height: 720 },
      parameters: JSON.parse(JSON.stringify(preset.parameters)),
      keyframeTracks: [
        {
          id: 'speed',
          name: 'Master Dynamics',
          targetProperty: 'speed',
          defaultValue: 1.0,
          min: 0.2,
          max: 3.0,
          keyframes: [
            { id: 'k1', time: 0, value: 1.0, easing: 'easeInOutQuad' },
            { id: 'k2', time: preset.duration / 2, value: 1.5, easing: 'easeInOutQuad' },
            { id: 'k3', time: preset.duration, value: 1.0, easing: 'easeInOutQuad' }
          ]
        }
      ],
      postProcessing: {
        bloom: preset.postProcessing?.bloom ?? true,
        bloomIntensity: preset.postProcessing?.bloomIntensity ?? 1.5,
        bloomRadius: preset.postProcessing?.bloomRadius ?? 18,
        chromaticAberration: preset.postProcessing?.chromaticAberration ?? false,
        aberrationAmount: 3,
        motionBlur: false,
        motionBlurDecay: 0.2,
        vignette: preset.postProcessing?.vignette ?? true,
        vignetteDarkness: 0.7,
        scanlines: preset.postProcessing?.scanlines ?? false,
        grain: false,
        grainIntensity: 0.1
      },
      audio: {
        enabled: false,
        synthPreset: 'synthwave',
        volume: 0.5,
        reactivitySensitivity: 1.5,
        bassImpact: 1.0,
        trebleImpact: 1.0
      },
      tags: preset.tags,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleGenerate = async (
    prompt: string,
    style: string,
    engine: 'auto' | 'canvas2d' | 'webgl-three',
    ratio: AspectRatioType
  ) => {
    const newProj = await generateAnimationFromPrompt({
      prompt,
      style,
      preferredEngine: engine,
      aspectRatio: ratio
    });

    setProject(newProj);
    setAspectRatio(ratio);
    setCurrentTime(0);
    setIsPlaying(true);

    // Fire celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 }
    });

    // Notify co-director chat
    setChatMessages((prev) => [
      ...prev,
      {
        id: 'gen_' + Date.now(),
        role: 'assistant',
        content: `I've synthesized a new animation based on your prompt: "${prompt}". Check out the live stage and inspect the customized variables!`,
        timestamp: Date.now()
      }
    ]);
  };

  const handleSendMessage = (text: string) => {
    const userMsg: AIChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatProcessing(true);

    setTimeout(() => {
      const { reply, updatedProject } = processDirectorCommand(text, project);
      if (updatedProject) {
        setProject(updatedProject);
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: 'ast_' + Date.now(),
          role: 'assistant',
          content: reply,
          timestamp: Date.now()
        }
      ]);
      setIsChatProcessing(false);
    }, 400);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#07080f] text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        appMode={appMode}
        onChangeAppMode={setAppMode}
        project={project}
        onUpdateTitle={handleUpdateTitle}
        onOpenAIGenerator={() => setIsAIPromptOpen(true)}
        onOpenGallery={() => setIsGalleryOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenAudio={() => setIsAudioOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
        isChatOpen={isChatOpen}
        activeRightTab={activeRightTab}
        onChangeRightTab={setActiveRightTab}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
      />

      {/* Main Workspace Body */}
      {appMode === 'character' ? (
        <CharacterStudio onToggleChat={() => setIsChatOpen((prev) => !prev)} />
      ) : (
        <>
          <div className="flex-1 flex overflow-hidden relative">
            {/* Viewport Canvas Stage */}
            <Viewport
              project={project}
              runnerRef={runnerRef}
              isPlaying={isPlaying}
              currentTime={currentTime}
              onTogglePlay={handleTogglePlay}
              onTimeUpdate={setCurrentTime}
              aspectRatio={aspectRatio}
              onChangeAspectRatio={setAspectRatio}
              onReset={handleReset}
              onStepFrame={handleStepFrame}
            />

            {/* Collapsible Left AI Co-Director Drawer */}
            <AIChatDrawer
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              isProcessing={isChatProcessing}
            />

            {/* Right Sidebar: Parameter Panel OR Code Editor */}
            {activeRightTab === 'params' ? (
              <ParameterPanel
                project={project}
                onUpdateParam={handleUpdateParam}
                onUpdatePostProcessing={handleUpdatePostProcessing}
                onResetParams={handleResetParams}
              />
            ) : (
              <CodeEditor
                code={project.code}
                onChangeCode={handleUpdateCode}
                onRecompile={handleRecompile}
                onAskAI={handleSendMessage}
              />
            )}
          </div>

          {/* Bottom Timeline Sequencer */}
          <Timeline
            project={project}
            currentTime={currentTime}
            onSeek={handleSeek}
            onUpdateDuration={(d) => setProject((prev) => ({ ...prev, duration: d }))}
          />
        </>
      )}

      {/* Modals */}
      <AIPromptModal
        isOpen={isAIPromptOpen}
        onClose={() => setIsAIPromptOpen(false)}
        onGenerate={handleGenerate}
      />

      <PresetGallery
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelectPreset={handleSelectPreset}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={project}
        getCanvas={() => runnerRef.current?.getCanvas() || null}
      />

      <AudioModal
        isOpen={isAudioOpen}
        onClose={() => setIsAudioOpen(false)}
        audioConfig={project.audio}
        onUpdateAudioConfig={handleUpdateAudioConfig}
      />

      <QuickGuideModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
export default App;
