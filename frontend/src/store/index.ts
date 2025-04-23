import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import metricsReducer from './slices/metricsSlice';
import reportsReducer from './slices/reportsSlice';
import dataSourcesReducer from './slices/dataSourcesSlice';
import alertsReducer from './slices/alertsSlice';
import { api } from './api';

/**
 * Configure Redux store with all reducers and middleware
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    metrics: metricsReducer,
    reports: reportsReducer,
    dataSources: dataSourcesReducer,
    alerts: alertsReducer,
    // Add the generated reducer as a specific top-level slice
    [api.reducerPath]: api.reducer,
  },
  // Adding the api middleware enables caching, invalidation, polling, and other features
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

// Configure listeners for automatic refetching
setupListeners(store.dispatch);

// Export types and hooks for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
