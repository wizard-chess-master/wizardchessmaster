import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

export function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      setError('No reset token provided');
      return;
    }

    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await fetch('/api/auth/validate-reset-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success && data.valid) {
        setIsValid(true);
        setUserEmail(data.email || '');
      } else {
        setIsValid(false);
        setError('Invalid or expired reset token');
      }
    } catch (error) {
      console.error('Token validation error:', error);
      setIsValid(false);
      setError('Failed to validate reset token');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/?tab=login');
        }, 3000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-amber-600">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-amber-900">Validating reset token...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-red-400">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-700">
              <AlertCircle className="w-6 h-6 inline-block mr-2" />
              Invalid Reset Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-300 bg-red-50">
              <AlertDescription className="text-red-700">
                {error || 'This password reset link is invalid or has expired.'}
              </AlertDescription>
            </Alert>
            
            <div className="text-center space-y-2">
              <p className="text-red-600 text-sm">
                Reset links expire after 1 hour for security.
              </p>
              <Button
                onClick={() => navigate('/?tab=login')}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                Return to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-green-400">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-700">
              <CheckCircle className="w-6 h-6 inline-block mr-2" />
              Password Reset Successful
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <Alert className="border-green-300 bg-green-50">
              <AlertDescription className="text-green-700">
                Your password has been successfully reset! You can now log in with your new password.
              </AlertDescription>
            </Alert>
            
            <p className="text-green-600 text-sm">
              Redirecting to login page in a few seconds...
            </p>
            
            <Button
              onClick={() => navigate('/?tab=login')}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-amber-600">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-amber-900">
            <Lock className="w-6 h-6 inline-block mr-2" />
            Reset Your Password
          </CardTitle>
          {userEmail && (
            <p className="text-amber-700 text-sm mt-2">
              For account: {userEmail}
            </p>
          )}
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert className="border-red-300 bg-red-50 mb-4">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-amber-900">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  disabled={isLoading}
                  className="border-amber-300 focus:border-amber-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-600 hover:text-amber-800"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-amber-900">
                Confirm New Password
              </Label>
              <Input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={isLoading}
                className="border-amber-300 focus:border-amber-500"
              />
            </div>

            <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded border border-amber-200">
              <strong>Password Requirements:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>At least 6 characters long</li>
                <li>Passwords must match</li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Resetting Password...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Reset Password
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}