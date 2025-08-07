import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Lock, Unlock, Shield, Eye, EyeOff } from 'lucide-react';
import { authenticateAdmin, logoutAdmin, getAdminStatus } from '../../lib/admin';

interface AdminLoginProps {
  onAuthChange?: (isAuthenticated: boolean) => void;
}

export function AdminLogin({ onAuthChange }: AdminLoginProps) {
  const [adminKey, setAdminKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const adminStatus = getAdminStatus();

  const handleLogin = () => {
    console.log('🔐 AdminLogin: handleLogin called with key:', adminKey.substring(0, 3) + '***');
    
    try {
      const result = authenticateAdmin(adminKey);
      console.log('🔐 AdminLogin: Authentication result:', result);
      
      if (result) {
        console.log('🔐 AdminLogin: Authentication successful, clearing form and notifying parent');
        setError('');
        setAdminKey('');
        setIsOpen(false);
        
        // Force a slight delay to ensure session is saved
        setTimeout(() => {
          console.log('🔐 AdminLogin: Calling onAuthChange(true)');
          onAuthChange?.(true);
          
          // Force a page refresh to ensure all components re-render
          console.log('🔐 AdminLogin: Forcing window reload to refresh all components');
          window.location.reload();
        }, 100);
      } else {
        console.log('🔐 AdminLogin: Authentication failed');
        setError('Invalid admin key');
      }
    } catch (error) {
      console.error('🔐 AdminLogin: Error during authentication:', error);
      setError('Authentication error occurred');
    }
  };

  const handleLogout = () => {
    console.log('🔐 AdminLogin: handleLogout called');
    
    try {
      logoutAdmin();
      console.log('🔐 AdminLogin: Logout successful, closing dialog and notifying parent');
      setIsOpen(false);
      
      // Force a slight delay and refresh
      setTimeout(() => {
        console.log('🔐 AdminLogin: Calling onAuthChange(false)');
        onAuthChange?.(false);
        
        console.log('🔐 AdminLogin: Forcing window reload to hide admin features');
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('🔐 AdminLogin: Error during logout:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  if (adminStatus.isEnabled && adminStatus.hasSession) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="medieval-btn">
            <Shield className="w-4 h-4 mr-1" />
            Admin
            <Badge variant="secondary" className="ml-2">Active</Badge>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Admin Panel
            </DialogTitle>
          </DialogHeader>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Unlock className="w-4 h-4 text-green-600" />
                Admin Access Active
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                You have admin privileges. Advanced features are now visible in the main menu.
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Development Mode:</span>
                  <Badge variant={adminStatus.isDevelopment ? "default" : "secondary"}>
                    {adminStatus.isDevelopment ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Environment Admin:</span>
                  <Badge variant={adminStatus.envAdminMode ? "default" : "secondary"}>
                    {adminStatus.envAdminMode ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Session Auth:</span>
                  <Badge variant={adminStatus.hasSession ? "default" : "secondary"}>
                    {adminStatus.hasSession ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
              
              <Button 
                onClick={handleLogout} 
                variant="destructive" 
                size="sm"
                className="w-full"
              >
                <Lock className="w-4 h-4 mr-2" />
                Logout Admin
              </Button>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    );
  }

  // Only show login option in development or if env admin mode is enabled
  if (!adminStatus.isDevelopment && !adminStatus.envAdminMode) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="medieval-btn opacity-50">
          <Lock className="w-4 h-4 mr-1" />
          Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-gray-600" />
            Admin Login
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-sm bg-blue-50 border border-blue-200 rounded p-3 mb-4">
          <strong>Test Admin Key:</strong> wizard-admin-2025<br/>
          <span className="text-xs text-gray-600">
            After successful login, page will reload and admin features will appear in the main menu.
          </span>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Enter Admin Key</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              Admin access enables advanced features like AI training, debugging tools, and system controls.
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showKey ? "text" : "password"}
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Admin key..."
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              
              {error && (
                <div className="text-sm text-red-600 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  {error}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleLogin} 
                disabled={!adminKey.trim()}
                className="flex-1"
              >
                <Unlock className="w-4 h-4 mr-2" />
                Login
              </Button>
              <Button 
                onClick={() => setIsOpen(false)} 
                variant="outline"
              >
                Cancel
              </Button>
            </div>
            
            <div className="text-xs text-gray-500 pt-2 border-t">
              <strong>Development Note:</strong> This login is only visible in development mode or when admin environment variables are set.
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}