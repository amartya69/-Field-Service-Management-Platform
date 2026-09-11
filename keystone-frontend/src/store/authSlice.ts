import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

const getInitialUser = (): User | null => {
  try {
    const data = localStorage.getItem('keystone_user');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: getInitialUser(),
  token: localStorage.getItem('keystone_token'),
  refreshToken: localStorage.getItem('keystone_refresh_token'),
  isAuthenticated: !!localStorage.getItem('keystone_token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ user: User; token: string; refreshToken: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;

      localStorage.setItem('keystone_user', JSON.stringify(action.payload.user));
      localStorage.setItem('keystone_token', action.payload.token);
      localStorage.setItem('keystone_refresh_token', action.payload.refreshToken);
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;

      localStorage.removeItem('keystone_user');
      localStorage.removeItem('keystone_token');
      localStorage.removeItem('keystone_refresh_token');
    },
    updateProfileSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem('keystone_user', JSON.stringify(action.payload));
    },
  },
});

export const { loginSuccess, logoutSuccess, updateProfileSuccess } = authSlice.actions;
export default authSlice.reducer;
