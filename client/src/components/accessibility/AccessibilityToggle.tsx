/**
 * Accessibility Toggle - One-Click Enable/Disable
 * Prominent toggle button for quick accessibility mode activation
 */

import React from 'react';
import { Button } from '../ui/button';
import { Accessibility, Eye, Volume2 } from 'lucide-react';
import { accessibilityManager } from '../../lib/accessibility/accessibilityManager';

interface AccessibilityToggleProps {
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export default function AccessibilityToggle({ 
  className, 
  variant = 'default',
  size = 'default' 
}: AccessibilityToggleProps) {
  const [isEnabled, setIsEnabled] = React.useState(false);
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    if (!isInitialized) {
      accessibilityManager.initialize();
      setIsEnabled(accessibilityManager.getSettings().enabled);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const handleToggle = () => {
    if (isEnabled) {
      accessibilityManager.disableAccessibilityMode();
      setIsEnabled(false);
    } else {
      accessibilityManager.enableAccessibilityMode();
      setIsEnabled(true);
    }
  };

  return (
    <Button
      onClick={handleToggle}
      variant={isEnabled ? 'default' : variant}
      size={size}
      className={`
        ${className}
        ${isEnabled ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
        accessible-button
        transition-colors duration-200
      `}
      aria-label={`${isEnabled ? 'Disable' : 'Enable'} accessibility mode for vision-impaired players`}
      aria-pressed={isEnabled}
      title={`${isEnabled ? 'Disable' : 'Enable'} accessibility features`}
    >
      <Accessibility className="w-4 h-4 mr-2" />
      {isEnabled ? (
        <>
          <span className="hidden sm:inline">Accessibility On</span>
          <span className="sm:hidden">A11y On</span>
          <div className="flex items-center ml-2 space-x-1">
            <Eye className="w-3 h-3" />
            <Volume2 className="w-3 h-3" />
          </div>
        </>
      ) : (
        <>
          <span className="hidden sm:inline">Enable Accessibility</span>
          <span className="sm:hidden">A11y Off</span>
        </>
      )}
    </Button>
  );
}