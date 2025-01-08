import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  fullName?: string;
  role: 'petitioner' | 'admin';
  bioId?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

interface SignupData {
  email: string;
  fullName: string;
  dateOfBirth: string;
  password: string;
  bioId: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const api = axios.create({
  baseURL: 'http://localhost:5002/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
          setIsLoading(false);
          return;
        }

        const response = await api.get('/auth/verify');
        const userData = response.data.user;

        setUser(userData);
        setToken(storedToken);
      } catch (error) {
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, data } = response.data;
      
      localStorage.setItem('token', token);
      
      setToken(token);
      setUser(data);
    } catch (error) {
      throw error;
    }
  };

  const signup = async (data: SignupData) => {
    try {
      const response = await api.post('/auth/signup', data);
      const { token, data: userData } = response.data;
      
      localStorage.setItem('token', token);
      
      setToken(token);
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
    login,
    signup,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};