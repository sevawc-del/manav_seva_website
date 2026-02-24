import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const decodeAndValidateToken = (token) => {
    const decoded = jwtDecode(token);
    if (decoded?.exp && decoded.exp * 1000 <= Date.now()) {
      throw new Error('Token expired');
    }
    return decoded;
  };

  useEffect(() => {
    const loadUser = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = decodeAndValidateToken(token);
          setUser({ ...decoded, token });
        } catch (error) {
          console.error('Invalid token:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = (userData) => {
    const { token } = userData;
    localStorage.setItem('token', token);
    try {
      const decoded = decodeAndValidateToken(token);
      setUser({ ...decoded, token });
    } catch (error) {
      console.error('Invalid token:', error);
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
