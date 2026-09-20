import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [club, setClub] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const parsed = savedUser ? JSON.parse(savedUser) : null;
      return parsed?.club || null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Clear session helper
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setClub(null);
  }, []);

  // Restore and validate session on mount or token change
  const restoreSession = useCallback(async () => {
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!storedToken) {
      setUser(null);
      setClub(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.getMe();
      const currentUser = response?.data?.user;
      if (currentUser) {
        setUser(currentUser);
        setClub(currentUser.club || null);
        localStorage.setItem('user', JSON.stringify(currentUser));
        setToken(storedToken);
      } else {
        logout();
      }
    } catch (err) {
      // If 401 Unauthorized, token has expired or is invalid
      if (err.response && err.response.status === 401) {
        console.warn('[AuthContext] Session expired or invalid. Logging out.');
        logout();
      } else {
        // If network error, preserve stored session optimistically
        console.warn('[AuthContext] Could not verify session with server:', err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Listen for global 401 unauthorized events from Axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      console.warn('[AuthContext] Unauthorized event received. Clearing session.');
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  // Login handler
  const login = async (credentials) => {
    const response = await authService.login(credentials);
    const { token: receivedToken, user: receivedUser, club: receivedClub } = response.data;

    if (receivedToken) {
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
    }
    if (receivedUser) {
      localStorage.setItem('user', JSON.stringify(receivedUser));
      setUser(receivedUser);
      setClub(receivedClub || receivedUser.club || null);
    }

    return response.data;
  };

  // Register handler
  const register = async (userData) => {
    const response = await authService.register(userData);
    const { token: receivedToken, user: receivedUser, club: receivedClub } = response.data;

    if (receivedToken) {
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
    }
    if (receivedUser) {
      localStorage.setItem('user', JSON.stringify(receivedUser));
      setUser(receivedUser);
      setClub(receivedClub || receivedUser.club || null);
    }

    return response.data;
  };

  // Refresh user profile helper
  const refreshUser = async () => {
    try {
      const response = await authService.getMe();
      const currentUser = response?.data?.user;
      if (currentUser) {
        setUser(currentUser);
        setClub(currentUser.club || null);
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
    } catch (err) {
      console.error('[AuthContext] Failed to refresh user profile:', err);
    }
  };

  const value = {
    user,
    token,
    club,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
