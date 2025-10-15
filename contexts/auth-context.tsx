import AsyncStorage from '@react-native-async-storage/async-storage';
// import createContextHook from '@nkzw/create-context-hook';
import createContainer  from 'constate';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, AuthState, LoginCredentials, SignupCredentials } from '../types/auth';

const STORAGE_KEYS = {
  USER: 'inventoree_user',
  TOKEN: 'inventoree_token',
};

// Mock users for demo
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@inventoree.com',
    password: 'admin123',
    name: 'Boss',
    role: 'admin' as const,
    createdAt: new Date().toISOString(),
  },
  // {
  //   id: '2',
  //   email: 'staff@inventoree.com',
  //   password: 'staff123',
  //   name: 'Staff User',
  //   role: 'staff' as const,
  //   createdAt: new Date().toISOString(),
  // },
];

export const [AuthProvider, useAuth] = createContainer(() => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedUser, storedToken] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
      ]);

      if (storedUser && storedToken) {
        setAuthState({
          user: JSON.parse(storedUser),
          token: storedToken,
          isLoading: false,
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const login = useCallback(async (credentials: LoginCredentials): Promise<{
    user: any; success: boolean; error?: string 
}> => {
    try {
      // Mock authentication
      const mockUser = MOCK_USERS.find(
        u => u.email === credentials.email && u.password === credentials.password
      );

      if (!mockUser) {
        return { success: false, error: 'Invalid email or password' };
      }

      const user: User = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        bio: '',
        profilePhoto: ''
      };

      const token = `mock_token_${Date.now()}`;

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token),
      ]);

      setAuthState({
        user,
        token,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }, []);

  const signup = useCallback(async (credentials: SignupCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check if user already exists
      const existingUser = MOCK_USERS.find(u => u.email === credentials.email);
      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }

      const user: User = {
        id: Date.now().toString(),
        email: credentials.email,
        name: credentials.name,
        role: credentials.role || 'staff',
        createdAt: new Date().toISOString(),
        bio: '',
        profilePhoto: ''
      };

      const token = `mock_token_${Date.now()}`;

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token),
      ]);

      setAuthState({
        user,
        token,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
        AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
      ]);

      setAuthState({
        user: null,
        token: null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const hasPermission = useCallback((requiredRole: 'admin' | 'staff' | 'viewer'): boolean => {
    if (!authState.user) return false;
    
    const roleHierarchy = { admin: 3, staff: 2, viewer: 1 };
    const userLevel = roleHierarchy[authState.user.role];
    const requiredLevel = roleHierarchy[requiredRole];
    
    return userLevel >= requiredLevel;
  }, [authState.user]);

  const updateProfile = useCallback(async (updates: Partial<Pick<User, 'name' | 'profilePhoto' | 'bio' | 'phone' | 'location'>>): Promise<{ success: boolean; error?: string }> => {
    if (!authState.user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const updatedUser = { ...authState.user, ...updates };
      
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));

      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Failed to update profile. Please try again.' };
    }
  }, [authState.user]);

  const getAllUsers = useCallback((): User[] => {
    return MOCK_USERS.map(({ password, ...user }) => user);
  }, []);

  return useMemo(() => ({
    ...authState,
    login,
    signup,
    logout,
    hasPermission,
    updateProfile,
    getAllUsers,
  }), [authState, login, signup, logout, hasPermission, updateProfile, getAllUsers]);
});