import { motion } from "framer-motion";
import { Brain, Clock, Sparkles } from "lucide-react";

interface AIThinkingIndicatorProps {
  message?: string;
  difficulty?: string;
}

export function AIThinkingIndicator({ message = "AI is thinking...", difficulty = "medium" }: AIThinkingIndicatorProps) {
  const getThinkingIcon = () => {
    switch (difficulty) {
      case 'easy':
        return <Clock className="w-6 h-6" />;
      case 'hard':
        return <Sparkles className="w-6 h-6" />;
      default:
        return <Brain className="w-6 h-6" />;
    }
  };

  const getThinkingMessage = () => {
    switch (difficulty) {
      case 'easy':
        return "AI is considering options...";
      case 'medium':
        return "AI is calculating the best move...";
      case 'hard':
        return "AI is analyzing complex strategies...";
      default:
        return message;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed top-4 right-4 z-50 bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg shadow-lg p-4 max-w-xs"
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-amber-600"
        >
          {getThinkingIcon()}
        </motion.div>
        
        <div className="flex-1">
          <h4 className="font-semibold text-amber-800 text-sm">AI Wizard</h4>
          <p className="text-amber-700 text-xs">{getThinkingMessage()}</p>
        </div>
      </div>
      
      {/* Animated thinking dots */}
      <div className="flex justify-center mt-2 gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2
            }}
            className="w-2 h-2 bg-amber-500 rounded-full"
          />
        ))}
      </div>
    </motion.div>
  );
}