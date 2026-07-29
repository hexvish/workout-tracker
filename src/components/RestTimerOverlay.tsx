import React, { useState, useEffect } from 'react';
import { Timer, Plus, Minus, SkipForward, Volume2 } from 'lucide-react';

interface RestTimerOverlayProps {
  initialSeconds: number;
  onFinish: () => void;
}

export const RestTimerOverlay: React.FC<RestTimerOverlayProps> = ({ initialSeconds, onFinish }) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);

  // Play web audio sound when timer hits 0
  const playBeepSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      // AudioContext fallback
    }
  };

  useEffect(() => {
    if (secondsLeft <= 0) {
      playBeepSound();
      onFinish();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const progressPercent = Math.max(0, Math.min(100, (secondsLeft / initialSeconds) * 100));

  const formatSecs = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 px-3 animate-slideUp">
      <div className="max-w-md mx-auto bg-[#16161A]/95 border border-indigo-500/50 backdrop-blur-md rounded-2xl p-3 shadow-2xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
            <Timer className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider">Rest Timer</span>
              <Volume2 className="w-3 h-3 text-indigo-400" />
            </div>
            <p className="text-lg font-black font-mono text-white leading-none mt-0.5">
              {formatSecs(secondsLeft)}
            </p>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setSecondsLeft((prev) => Math.max(0, prev - 10))}
            className="p-1.5 bg-[#0A0A0C] hover:bg-zinc-800 border border-white/5 text-zinc-300 rounded-lg text-xs font-bold"
            title="-10s"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setSecondsLeft((prev) => prev + 30)}
            className="p-1.5 bg-[#0A0A0C] hover:bg-zinc-800 border border-white/5 text-zinc-300 rounded-lg text-xs font-bold"
            title="+30s"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onFinish}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-all shadow-md"
          >
            <SkipForward className="w-3.5 h-3.5" /> Skip
          </button>
        </div>
      </div>
    </div>
  );
};
