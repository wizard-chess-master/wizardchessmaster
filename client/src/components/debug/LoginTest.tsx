import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function LoginTest() {
  const [credentials, setCredentials] = useState({
    username: 'Tokingteepee',
    password: 'WizardChess123!'
  });
  const [response, setResponse] = useState('');
  const [sessionInfo, setSessionInfo] = useState('');

  const testLogin = async () => {
    try {
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials),
        credentials: 'include'  // Important: include cookies
      });
      
      const loginData = await loginResponse.json();
      setResponse(JSON.stringify(loginData, null, 2));
      
      // Immediately check session
      const sessionResponse = await fetch('/api/auth/session', {
        credentials: 'include'
      });
      const sessionData = await sessionResponse.json();
      setSessionInfo(JSON.stringify(sessionData, null, 2));
      
    } catch (error) {
      setResponse(`Error: ${error}`);
    }
  };

  const testSession = async () => {
    try {
      const sessionResponse = await fetch('/api/auth/session', {
        credentials: 'include'
      });
      const sessionData = await sessionResponse.json();
      setSessionInfo(JSON.stringify(sessionData, null, 2));
    } catch (error) {
      setSessionInfo(`Error: ${error}`);
    }
  };

  const testLogout = async () => {
    try {
      const logoutResponse = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      const logoutData = await logoutResponse.json();
      setResponse(JSON.stringify(logoutData, null, 2));
      
      // Check session after logout
      setTimeout(testSession, 100);
    } catch (error) {
      setResponse(`Error: ${error}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Login Debug Tool</CardTitle>
          <CardDescription>Test authentication directly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Username</Label>
            <Input 
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input 
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={testLogin}>Test Login</Button>
            <Button onClick={testSession} variant="outline">Check Session</Button>
            <Button onClick={testLogout} variant="destructive">Test Logout</Button>
          </div>
        </CardContent>
      </Card>

      {response && (
        <Alert>
          <AlertDescription>
            <strong>Login Response:</strong>
            <pre className="mt-2 text-xs overflow-auto">{response}</pre>
          </AlertDescription>
        </Alert>
      )}

      {sessionInfo && (
        <Alert>
          <AlertDescription>
            <strong>Session Info:</strong>
            <pre className="mt-2 text-xs overflow-auto">{sessionInfo}</pre>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}