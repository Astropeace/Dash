import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme';
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';

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

// Simplified auth for MVP
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Always allow access in development MVP
  return <>{children}</>;
};

// Public route for MVP
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

function App() {
  const { darkMode } = useSelector((state: RootState) => state.ui);
  const currentTheme = getTheme(darkMode ? 'dark' : 'light');

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Routes>
      {/* Auth routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      </Route>

      {/* Application routes */}
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="campaigns" element={<CampaignsPage />} />
        <Route path="investors" element={<InvestorsPage />} />
        <Route path="metrics" element={<MetricsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="data-sources" element={<DataSourcesPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* 404 route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </ThemeProvider>
  );
}

export default App;
