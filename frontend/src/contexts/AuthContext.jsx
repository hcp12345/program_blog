/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 初始化时从 localStorage 恢复用户信息
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // 设置 API 默认 token
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  // 登录
  const login = useCallback(async (username, password) => {
    try {
      const response = await api.post('/users/login', { username, password });

      if (response.success) {
        const { user: userData, token } = response.data;

        // 保存到 localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));

        // 设置 API 默认 token
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        setUser(userData);
        return { success: true, user: userData };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: error.message || '登录失败，请稍后重试',
      };
    }
  }, []);

  // 注册
  const register = useCallback(async (userData) => {
    try {
      const response = await api.post('/users/register', userData);

      if (response.success) {
        return { success: true, message: '注册成功，请登录' };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: error.message || '注册失败，请稍后重试',
      };
    }
  }, []);

  // 登出
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  // 更新用户信息
  const updateProfile = useCallback(async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);

      if (response.success) {
        const updatedUser = response.data;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true, user: updatedUser };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: error.message || '更新失败，请稍后重试',
      };
    }
  }, []);

  // 修改密码
  const changePassword = useCallback(async (oldPassword, newPassword) => {
    try {
      const response = await api.put('/users/password', { oldPassword, newPassword });

      if (response.success) {
        return { success: true, message: '密码修改成功' };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: error.message || '密码修改失败，请稍后重试',
      };
    }
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
