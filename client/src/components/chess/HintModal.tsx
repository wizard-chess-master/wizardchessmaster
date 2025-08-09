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

  // Force close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        // Close when clicking on backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-gradient-to-b from-amber-50 to-amber-100 border-4 border-amber-600 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-4 rounded-t-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧙‍♂️</span>
            <h2 className="text-amber-100 font-bold text-lg">Wizard Chess Battle Hint</h2>
          </div>
          <button
            onClick={onClose}
            className="text-amber-200 hover:text-white transition-colors hover:bg-amber-800/20 rounded-full p-1"
            title="Close hint"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-white/80 rounded-lg p-5 border-2 border-amber-300 shadow-md">
            <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2 text-lg">
              <span>⚡</span> Recommended Move
            </h3>
            <p className="text-gray-800 leading-relaxed text-base">{hintDescription}</p>
          </div>
          
          <div className="bg-white/80 rounded-lg p-5 border-2 border-amber-300 shadow-md">
            <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2 text-lg">
              <span>🧠</span> Strategic Value
            </h3>
            <p className="text-gray-800 leading-relaxed text-base">{hintReasoning}</p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 bg-amber-50 rounded-b-md border-t border-amber-300">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg text-lg"
          >
            ✨ Got it, let's battle!
          </button>
        </div>
      </div>
    </div>
  );
}