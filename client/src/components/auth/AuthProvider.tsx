import React, { useEffect, ReactNode } from 'react';
import { useAuth } from '../../lib/stores/useAuth';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { checkSession } = useAuth();

  useEffect(() => {
    // Check session on app load
    checkSession();
  }, [checkSession]);

  return <>{children}</>;
}