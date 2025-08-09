import React from 'react';
import { X } from 'lucide-react';

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  hintDescription: string;
  hintReasoning: string;
}

export function HintModal({ isOpen, onClose, hintDescription, hintReasoning }: HintModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-amber-50 to-amber-100 border-4 border-amber-600 rounded-lg shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-4 rounded-t-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧙‍♂️</span>
            <h2 className="text-amber-100 font-bold text-lg">Wizard Chess Battle Hint</h2>
          </div>
          <button
            onClick={onClose}
            className="text-amber-200 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-white/70 rounded-lg p-4 border-2 border-amber-300">
            <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-1">
              <span>⚡</span> Recommended Move
            </h3>
            <p className="text-gray-800 leading-relaxed">{hintDescription}</p>
          </div>
          
          <div className="bg-white/70 rounded-lg p-4 border-2 border-amber-300">
            <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-1">
              <span>🧠</span> Strategic Value
            </h3>
            <p className="text-gray-800 leading-relaxed">{hintReasoning}</p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-amber-50 rounded-b-md border-t border-amber-300">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-lg"
          >
            ✨ Got it, let's battle!
          </button>
        </div>
      </div>
    </div>
  );
}