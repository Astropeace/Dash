import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const AuthLayout: React.FC = () => {
  const theme = useTheme();
  const { darkMode } = useSelector((state: RootState) => state.ui);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[900],
      }}
    >
      <Container component="main" maxWidth="xs" sx={{ mt: 8, mb: 2 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Logo/Header */}
          <Typography component="h1" variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
            Financial Analytics
          </Typography>

          {/* Auth content (login, register, etc.) */}
          <Outlet />
        </Paper>

        {/* Footer */}
        <Box
          sx={{
            mt: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: 0.8,
          }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Financial Analytics Dashboard. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AuthLayout;
