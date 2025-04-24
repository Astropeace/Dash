import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Button, Box, Stack } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google'; // Assuming you have @mui/icons-material installed

// Get backend API URL from environment variables (ensure VITE_API_URL is set in .env)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001'; // Default for safety

const LandingPage: React.FC = () => {

  const handleGoogleSignIn = () => {
    // Redirect the browser to the backend Google OAuth initiation route
    window.location.href = `${API_URL}/api/v1/auth/google`;
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh', // Full viewport height
        textAlign: 'center',
      }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Financial Analytics Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Unlock insights from your financial data.
        </Typography>
      </Box>

      <Stack spacing={2} direction="column" sx={{ width: '100%', maxWidth: '300px' }}>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/login"
          size="large"
        >
          Sign In
        </Button>
        <Button
          variant="outlined"
          color="primary"
          component={RouterLink}
          to="/register"
          size="large"
        >
          Create Account
        </Button>
        <Button
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignIn}
          size="large"
          sx={{ textTransform: 'none' }} // Prevent uppercase text
        >
          Sign in with Google
        </Button>
      </Stack>
    </Container>
  );
};

export default LandingPage;
