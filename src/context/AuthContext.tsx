"use client"; // Required for context in App Router

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of your authentication context
interface AuthContextType {
  isAuthenticated: boolean;
  user: any; // Replace 'any' with your user type
  login: () => void;
  logout: () => void;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null); // Replace 'any' with your user type

  const login = () => {
    // Implement your login logic here
    setIsAuthenticated(true);
    setUser({ name: "Test User" }); // Replace with actual user data
    console.log("User logged in");
  };

  const logout = () => {
    // Implement your logout logic here
    setIsAuthenticated(false);
    setUser(null);
    console.log("User logged out");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
