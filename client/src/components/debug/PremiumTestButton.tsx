import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Crown, Zap } from 'lucide-react';

interface PremiumTestButtonProps {
  email?: string;
}

export function PremiumTestButton({ email = 'tokingteepee@gmail.com' }: PremiumTestButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleGrantPremium = async () => {
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/auth/grant-premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`Premium access granted to ${email}! Please refresh to see changes.`);
        console.log('✅ Premium access granted:', data);
        
        // Refresh the page after 2 seconds to update the auth state
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError(data.error || 'Failed to grant premium access');
      }
    } catch (error) {
      console.error('Premium grant error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-amber-100 border-2 border-amber-600 rounded-lg p-4 shadow-lg">
      <h4 className="text-amber-900 font-bold mb-2">
        <Zap className="w-4 h-4 inline mr-1" />
        Development Tools
      </h4>
      
      {message && (
        <Alert className="border-green-300 bg-green-50 mb-3">
          <AlertDescription className="text-green-700 text-sm">
            {message}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-300 bg-red-50 mb-3">
          <AlertDescription className="text-red-700 text-sm">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <p className="text-amber-800 text-sm">
          Email: <code className="bg-amber-200 px-1 rounded text-xs">{email}</code>
        </p>
        
        <Button
          onClick={handleGrantPremium}
          disabled={isLoading}
          size="sm"
          className="w-full bg-amber-600 hover:bg-amber-700 text-white"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
              Granting...
            </>
          ) : (
            <>
              <Crown className="w-3 h-3 mr-2" />
              Grant Premium Access
            </>
          )}
        </Button>
      </div>
    </div>
  );
}