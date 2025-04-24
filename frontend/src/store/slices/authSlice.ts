import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define types for the authentication state
export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// For MVP, set a default demo user to be always logged in
const demoUser: User = {
  id: 'demo-id',
  email: 'demo@example.com',
  firstName: 'Demo',
  lastName: 'User',
  roles: ['admin'],
};

// Initial state - for MVP, let's have user already logged in
const initialState: AuthState = {
  user: demoUser,
  token: 'demo-token',
  refreshToken: 'demo-refresh-token',
  isAuthenticated: true, // For MVP, always authenticated
  isLoading: false,
  error: null,
};

// Create slice with reducers
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login actions
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string; refreshToken: string }>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      
      // Save tokens to local storage
      localStorage.setItem('auth_token', action.payload.token);
      localStorage.setItem('refresh_token', action.payload.refreshToken);
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.error = action.payload;
    },
    
    // Logout action
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    },
    
    // Update user profile
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    
    // Token refresh actions
    refreshTokenStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    refreshTokenSuccess: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.token = action.payload;
      localStorage.setItem('auth_token', action.payload);
    },
    refreshTokenFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

// Export actions and reducer
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUserProfile,
  refreshTokenStart,
  refreshTokenSuccess,
  refreshTokenFailure,
} = authSlice.actions;

export default authSlice.reducer;
