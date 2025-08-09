import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/stores/useAuth';
import cloudSaveManager from '@/lib/saves/cloudSaveManager';
import { Cloud, Download, Upload, Save, Crown, AlertCircle, CheckCircle, Database } from 'lucide-react';

interface CloudSaveDialogProps {
  children: React.ReactNode;
}

export function CloudSaveDialog({ children }: CloudSaveDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  const { isLoggedIn, isPremium } = useAuth();

  const handleSaveToCloud = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await cloudSaveManager.saveToCloud();
      
      if (result.success) {
        setMessage({
          type: 'success',
          text: result.message || 'Progress saved to cloud successfully!'
        });
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to save to cloud'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Network error during cloud save'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadFromCloud = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await cloudSaveManager.loadFromCloud();
      
      if (result.success) {
        if (result.saveData) {
          setMessage({
            type: 'success',
            text: 'Progress loaded from cloud! The page will refresh to apply changes.'
          });
          // Dialog will close when page reloads
        } else {
          setMessage({
            type: 'info',
            text: 'No cloud save data found'
          });
        }
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to load from cloud'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Network error during cloud load'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLocalBackup = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await cloudSaveManager.createLocalBackup();
      
      if (result.success) {
        setMessage({
          type: 'success',
          text: 'Local backup created successfully!'
        });
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to create local backup'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Network error during backup creation'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreLocalBackup = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await cloudSaveManager.restoreFromLocalBackup();
      
      if (result.success) {
        if (result.saveData) {
          setMessage({
            type: 'success',
            text: 'Local backup restored! The page will refresh to apply changes.'
          });
          // Dialog will close when page reloads
        } else {
          setMessage({
            type: 'info',
            text: 'No local backup found'
          });
        }
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to restore local backup'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Network error during backup restore'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-blue-50 to-indigo-100 border-2 border-blue-600">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-900 text-center">
            <Cloud className="w-6 h-6 inline-block mr-2" />
            Game Progress Manager
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {message && (
            <Alert className={`border-2 ${
              message.type === 'success' ? 'border-green-300 bg-green-50' :
              message.type === 'error' ? 'border-red-300 bg-red-50' :
              'border-blue-300 bg-blue-50'
            }`}>
              {message.type === 'success' && <CheckCircle className="h-4 w-4" />}
              {message.type === 'error' && <AlertCircle className="h-4 w-4" />}
              <AlertDescription className={
                message.type === 'success' ? 'text-green-700' :
                message.type === 'error' ? 'text-red-700' :
                'text-blue-700'
              }>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {!isLoggedIn && (
            <Alert className="border-amber-300 bg-amber-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-amber-700">
                You need to be logged in to save and load your progress.
              </AlertDescription>
            </Alert>
          )}

          {isLoggedIn && (
            <>
              {/* Cloud Save Section (Premium) */}
              <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-blue-900 flex items-center">
                    <Cloud className="w-4 h-4 mr-2" />
                    Cloud Saves
                  </h3>
                  {isPremium() ? (
                    <Crown className="w-4 h-4 text-amber-600" />
                  ) : (
                    <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full">
                      Premium Only
                    </span>
                  )}
                </div>

                {isPremium() ? (
                  <div className="space-y-2">
                    <p className="text-sm text-blue-700 mb-3">
                      Sync your progress across all devices with cloud saves.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={handleSaveToCloud}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        onClick={handleLoadFromCloud}
                        disabled={isLoading}
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50 text-sm"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Load
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-blue-700">
                    Upgrade to Premium to sync your progress across all devices!
                  </p>
                )}
              </div>

              {/* Local Backup Section (All logged-in users) */}
              <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Database className="w-4 h-4 mr-2" />
                    Local Backup
                  </h3>
                  <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                    Free
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-700 mb-3">
                    Create a backup of your progress on our servers.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={handleCreateLocalBackup}
                      disabled={isLoading}
                      className="bg-gray-600 hover:bg-gray-700 text-white text-sm"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Backup
                    </Button>
                    <Button
                      onClick={handleRestoreLocalBackup}
                      disabled={isLoading}
                      variant="outline"
                      className="border-gray-600 text-gray-600 hover:bg-gray-50 text-sm"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Restore
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="text-center text-xs text-gray-500 bg-gray-100 p-2 rounded">
            Progress is automatically saved to your browser. Use these options to backup or sync across devices.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}