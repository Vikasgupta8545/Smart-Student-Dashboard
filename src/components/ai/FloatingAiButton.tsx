import React from 'react';
import { Sparkles } from 'lucide-react';

interface FloatingAiButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export const FloatingAiButton: React.FC<FloatingAiButtonProps> = ({ onClick, isOpen }) => {
  if (isOpen) return null;

  return (
    <button
      id="btn-floating-ai-assistant"
      onClick={onClick}
      className="group fixed bottom-20 right-5 z-40 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 p-3.5 text-white shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-indigo-600/40 active:scale-95 sm:bottom-8 sm:right-8 sm:px-5 sm:py-3.5"
      aria-label="Open AI Academic Assistant"
    >
      <div className="relative flex items-center justify-center">
        <Sparkles className="h-5 w-5 text-amber-300 transition-transform group-hover:rotate-12" />
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-400"></span>
        </span>
      </div>

      <div className="hidden text-left sm:block">
        <p className="text-xs font-bold leading-tight">CampusAI Mentor</p>
        <p className="text-[10px] text-indigo-100 font-medium">Smart Study Assistant</p>
      </div>
    </button>
  );
};
