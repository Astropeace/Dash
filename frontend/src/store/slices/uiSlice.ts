import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Interface for the UI state
export interface UiState {
  sidebarOpen: boolean;
  darkMode: boolean;
  notifications: Notification[];
  currentTab: string;
  filterDateRange: {
    startDate: string | null;
    endDate: string | null;
  };
  loading: {
    [key: string]: boolean;
  };
  errors: {
    [key: string]: string | null;
  };
}

// Notification interface
export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

// Initial UI state
const initialState: UiState = {
  sidebarOpen: true,
  darkMode: localStorage.getItem('darkMode') === 'true',
  notifications: [],
  currentTab: 'dashboard',
  filterDateRange: {
    startDate: null,
    endDate: null,
  },
  loading: {},
  errors: {},
};

// Create UI slice
export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sidebar toggle
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    
    // Dark mode toggle
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode.toString());
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
      localStorage.setItem('darkMode', action.payload.toString());
    },
    
    // Notification management
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'read' | 'createdAt'>>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        message: action.payload.message,
        type: action.payload.type,
        read: false,
        createdAt: new Date().toISOString(),
      };
      state.notifications.unshift(notification);
      
      // Limit to 20 notifications
      if (state.notifications.length > 20) {
        state.notifications.pop();
      }
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Current tab
    setCurrentTab: (state, action: PayloadAction<string>) => {
      state.currentTab = action.payload;
    },
    
    // Date range filter
    setFilterDateRange: (state, action: PayloadAction<{ startDate: string | null; endDate: string | null }>) => {
      state.filterDateRange = action.payload;
    },
    
    // Loading states
    setLoading: (state, action: PayloadAction<{ key: string; isLoading: boolean }>) => {
      state.loading[action.payload.key] = action.payload.isLoading;
    },
    
    // Error states
    setError: (state, action: PayloadAction<{ key: string; error: string | null }>) => {
      state.errors[action.payload.key] = action.payload.error;
    },
    clearError: (state, action: PayloadAction<string>) => {
      state.errors[action.payload] = null;
    },
    clearAllErrors: (state) => {
      state.errors = {};
    },
  },
});

// Export actions and reducer
export const {
  toggleSidebar,
  setSidebarOpen,
  toggleDarkMode,
  setDarkMode,
  addNotification,
  markNotificationAsRead,
  clearNotifications,
  setCurrentTab,
  setFilterDateRange,
  setLoading,
  setError,
  clearError,
  clearAllErrors,
} = uiSlice.actions;

export default uiSlice.reducer;
