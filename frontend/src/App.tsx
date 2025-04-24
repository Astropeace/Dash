import React, { ReactNode } from 'react'; // Import ReactNode
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store'; // Assuming RootState is correctly defined
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme';
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import LandingPage from './pages/LandingPage'; // Import LandingPage
import SelectTenantPage from './pages/auth/SelectTenantPage'; // Import SelectTenantPage

// Import real page components
import CampaignsPage from './pages/campaigns/CampaignsPage';
import InvestorsPage from './pages/investors/InvestorsPage';
import MetricsPage from './pages/metrics/MetricsPage';
import ReportsPage from './pages/reports/ReportsPage';
import DataSourcesPage from './pages/datasources/DataSourcesPage';
import AlertsPage from './pages/alerts/AlertsPage';

// Placeholder components for MVP
const PlaceholderPage = ({ title }: { title: string }) => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>{title}</h2>
    <p>This page is coming soon in a future update.</p>
  </div>
);

// Use placeholders for pages not yet implemented
const SettingsPage = () => <PlaceholderPage title="Settings" />;
const ProfilePage = () => <PlaceholderPage title="Profile" />;

// --- Authentication Route Guards ---

// Protect routes that require authentication
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { token } = useSelector((state: RootState) => state.auth); // Assuming token exists in auth state
  // TODO: Add check for pending session state if needed for /select-tenant specifically
  if (!token) {
    // Redirect to landing page if not authenticated
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// Protect routes that should only be accessed when unauthenticated (like login/register)
const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { token } = useSelector((state: RootState) => state.auth);
  if (token) {
    // Redirect to dashboard if already authenticated
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

// Route for tenant selection - might need more specific logic later
// For now, treat it like a protected route that doesn't require full JWT auth yet
// but relies on the backend session check within the component itself.
const SelectTenantRoute = ({ children }: { children: ReactNode }) => {
   // In a real app, you might add a check here if possible,
   // otherwise the component handles the redirect if no pending session exists.
   return <>{children}</>;
};


function App() {
  const { darkMode } = useSelector((state: RootState) => state.ui);
  // const { token } = useSelector((state: RootState) => state.auth); // Get auth token
  const currentTheme = getTheme(darkMode ? 'dark' : 'light');

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Routes>
        {/* Landing Page (Root for unauthenticated users) */}
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />

        {/* Auth routes */}
        <Route path="/auth" element={<PublicRoute><AuthLayout /></PublicRoute>}>
          {/* Redirect /auth to /auth/login */}
          <Route index element={<Navigate to="/auth/login" replace />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          {/* Keep AuthLayout for these pages */}
        </Route>

        {/* Tenant Selection Route (after Google OAuth redirect) */}
        {/* This route needs protection based on server session, handled within the component for now */}
         <Route path="/select-tenant" element={<SelectTenantRoute><SelectTenantPage /></SelectTenantRoute>} />


        {/* Main Application routes (Protected) */}
        <Route path="/app" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
           {/* Redirect /app to /app/dashboard */}
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="investors" element={<InvestorsPage />} />
          <Route path="metrics" element={<MetricsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="data-sources" element={<DataSourcesPage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
           {/* Add other protected routes under /app */}
        </Route>

        {/* Redirect authenticated users from root to dashboard */}
        {/* This needs careful placement or integration with PublicRoute logic */}
        {/* <Route path="/" element={token ? <Navigate to="/app/dashboard" replace /> : <LandingPage />} /> */}
        {/* Let PublicRoute handle the root path redirection for now */}


        {/* 404 route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </ThemeProvider>
  );
}

export default App;
