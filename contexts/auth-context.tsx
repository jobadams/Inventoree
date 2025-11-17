import AsyncStorage from '@react-native-async-storage/async-storage';
import createContainer from 'constate';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, AuthState, LoginCredentials, SignupCredentials } from '../types/auth';

const STORAGE_KEYS = {
  USER: 'inventoree_user',
  TOKEN: 'inventoree_token',
  USERS: 'inventoree_users', // Stores all registered users
};

export const [AuthProvider, useAuth] = createContainer(() => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  // Load current session
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

  // 🧩 Helper to load all stored users
  const getStoredUsers = async (): Promise<User[]> => {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  };

  // 🧠 Save users
  const saveUsers = async (users: User[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  };

  // ✅ Login
  const login = useCallback(async (credentials: LoginCredentials): Promise<{ user?: User; success: boolean; error?: string }> => {
    try {
      const users = await getStoredUsers();

      const foundUser = users.find(
        u => u.email === credentials.email && u.password === credentials.password
      );

      if (!foundUser) {
        return { success: false, error: 'Invalid email or password' };
      }

      const token = `inventoree_token_${Date.now()}`;

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(foundUser)),
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token),
      ]);

      setAuthState({
        user: foundUser,
        token,
        isLoading: false,
      });

      return { success: true, user: foundUser };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }, []);

  // 🆕 Signup
  const signup = useCallback(async (credentials: SignupCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      const users = await getStoredUsers();

      // Check if user already exists
      const existingUser = users.find(u => u.email === credentials.email);
      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }

      const newUser: User = {
        id: Date.now().toString(),
        email: credentials.email,
        password: credentials.password, // stored locally for now
        name: credentials.name,
        role: credentials.role || 'staff',
        createdAt: new Date().toISOString(),
        bio: '',
        profilePhoto: '',
      };

      const token = `inventoree_token_${Date.now()}`;

      const updatedUsers = [...users, newUser];
      await Promise.all([
        saveUsers(updatedUsers),
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser)),
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token),
      ]);

      setAuthState({
        user: newUser,
        token,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  }, []);

  // 🚪 Logout
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

  // 👑 Role-based permission
  const hasPermission = useCallback((requiredRole: 'admin' | 'staff' | 'viewer'): boolean => {
    if (!authState.user) return false;
    const roleHierarchy = { admin: 3, staff: 2, viewer: 1 };
    return roleHierarchy[authState.user.role] >= roleHierarchy[requiredRole];
  }, [authState.user]);

  // 🪪 Update Profile
  const updateProfile = useCallback(async (updates: Partial<Pick<User, 'name' | 'profilePhoto' | 'bio' | 'phone' | 'location'>>): Promise<{ success: boolean; error?: string }> => {
    if (!authState.user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const users = await getStoredUsers();
      const updatedUser = { ...authState.user, ...updates };

      const updatedUsers = users.map(u => (u.id === updatedUser.id ? updatedUser : u));

      await Promise.all([
        saveUsers(updatedUsers),
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser)),
      ]);

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

  // 👥 Fetch all users (for admin)
  const getAllUsers = useCallback(async (): Promise<User[]> => {
    return await getStoredUsers();
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
