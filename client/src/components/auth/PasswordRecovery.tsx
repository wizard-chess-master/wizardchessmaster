import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail, Lock, CheckCircle } from 'lucide-react';

interface PasswordRecoveryProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

export function PasswordRecovery({ isOpen, onClose, onBackToLogin }: PasswordRecoveryProps) {
  const [step, setStep] = useState<'request' | 'success'>('request');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState(''); // For development

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        if (data.resetToken) {
          setResetToken(data.resetToken);
        }
        setStep('success');
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Password recovery error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('request');
    setEmail('');
    setError('');
    setResetToken('');
    onClose();
  };

  const handleBackToLogin = () => {
    handleClose();
    onBackToLogin();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-amber-50 to-orange-100 border-2 border-amber-600">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-amber-900 text-center">
            {step === 'request' ? (
              <>
                <Lock className="w-6 h-6 inline-block mr-2" />
                Forgot Password
              </>
            ) : (
              <>
                <CheckCircle className="w-6 h-6 inline-block mr-2 text-green-600" />
                Check Your Email
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {step === 'request' ? (
          <div className="space-y-4">
            <p className="text-amber-800 text-center">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {error && (
              <Alert className="border-red-300 bg-red-50">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recovery-email" className="text-amber-900">
                  Email Address
                </Label>
                <Input
                  id="recovery-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                  className="border-amber-300 focus:border-amber-500"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending Reset Link...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Reset Link
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToLogin}
                  className="w-full border-amber-600 text-amber-700 hover:bg-amber-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 font-medium">Reset link sent!</p>
              <p className="text-green-700 text-sm mt-2">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
            </div>

            {resetToken && (
              <Alert className="border-blue-300 bg-blue-50">
                <AlertDescription className="text-blue-700">
                  <strong>Development Mode:</strong> Your reset token is: 
                  <code className="block mt-1 p-2 bg-blue-100 rounded text-xs break-all">
                    {resetToken}
                  </code>
                  <a 
                    href={`/reset-password?token=${resetToken}`}
                    className="text-blue-600 underline hover:text-blue-800 text-sm block mt-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Click here to reset your password
                  </a>
                </AlertDescription>
              </Alert>
            )}

            <div className="text-sm text-amber-700">
              <p>Didn't receive the email? Check your spam folder.</p>
              <p className="mt-1">The reset link will expire in 1 hour.</p>
            </div>

            <div className="flex flex-col space-y-2">
              <Button
                onClick={() => setStep('request')}
                variant="outline"
                className="w-full border-amber-600 text-amber-700 hover:bg-amber-50"
              >
                Send Another Link
              </Button>

              <Button
                onClick={handleBackToLogin}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}