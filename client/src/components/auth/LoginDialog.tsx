import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/stores/useAuth';
import { LogIn, UserPlus, Crown } from 'lucide-react';

interface LoginDialogProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

export function LoginDialog({ children, onSuccess }: LoginDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  
  // Login form state
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });

  const { login, register, isLoading, error, clearError } = useAuth();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    const success = await login(loginData);
    if (success) {
      setIsOpen(false);
      setLoginData({ username: '', password: '' });
      onSuccess?.();
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (registerData.password !== registerData.confirmPassword) {
      return;
    }

    const { confirmPassword, ...userData } = registerData;
    const success = await register(userData);
    
    if (success) {
      setIsOpen(false);
      setRegisterData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        displayName: ''
      });
      onSuccess?.();
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      clearError();
      setLoginData({ username: '', password: '' });
      setRegisterData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        displayName: ''
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-amber-50 to-orange-100 border-2 border-amber-600">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-amber-900 text-center">
            <Crown className="w-6 h-6 inline-block mr-2" />
            Join the Wizard Chess Academy
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-amber-100">
            <TabsTrigger value="login" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Register
            </TabsTrigger>
          </TabsList>

          {error && (
            <Alert className="border-red-300 bg-red-50">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username" className="text-amber-900">Username</Label>
                <Input
                  id="login-username"
                  type="text"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  placeholder="Enter your username"
                  required
                  className="border-amber-300 focus:border-amber-600"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-amber-900">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                  className="border-amber-300 focus:border-amber-600"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-username" className="text-amber-900">Username</Label>
                <Input
                  id="register-username"
                  type="text"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  placeholder="Choose a username"
                  required
                  className="border-amber-300 focus:border-amber-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email" className="text-amber-900">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  placeholder="Enter your email"
                  required
                  className="border-amber-300 focus:border-amber-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-display-name" className="text-amber-900">Display Name</Label>
                <Input
                  id="register-display-name"
                  type="text"
                  value={registerData.displayName}
                  onChange={(e) => setRegisterData({ ...registerData, displayName: e.target.value })}
                  placeholder="How should others see your name?"
                  required
                  className="border-amber-300 focus:border-amber-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-amber-900">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  placeholder="Create a password"
                  required
                  minLength={6}
                  className="border-amber-300 focus:border-amber-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm-password" className="text-amber-900">Confirm Password</Label>
                <Input
                  id="register-confirm-password"
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  placeholder="Confirm your password"
                  required
                  className="border-amber-300 focus:border-amber-600"
                />
                {registerData.password && registerData.confirmPassword && 
                 registerData.password !== registerData.confirmPassword && (
                  <p className="text-sm text-red-600">Passwords do not match</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                disabled={isLoading || registerData.password !== registerData.confirmPassword}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-amber-700 bg-amber-200 p-3 rounded-lg">
          <Crown className="w-4 h-4 inline mr-1" />
          Create an account to save your progress and unlock premium features!
        </div>
      </DialogContent>
    </Dialog>
  );
}