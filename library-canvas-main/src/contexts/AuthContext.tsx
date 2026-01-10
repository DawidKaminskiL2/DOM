import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => void;
  logout: () => void;
  getAuthHeader: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUsername = localStorage.getItem('username');
    if (storedToken && storedUsername) {
      setAuthToken(storedToken);
      setUsername(storedUsername);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (username: string, password: string) => {
    const token = btoa(`${username}:${password}`);
    localStorage.setItem('authToken', token);
    localStorage.setItem('username', username);
    setAuthToken(token);
    setUsername(username);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    setAuthToken(null);
    setUsername(null);
    setIsAuthenticated(false);
  };

  const getAuthHeader = () => {
    return authToken ? `Basic ${authToken}` : null;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, logout, getAuthHeader }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
