import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';

const ForgotPasswordPage: React.FC = () => {
  // Form state
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState('');

  // Validate email
  const validateEmail = (): boolean => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // For demo purposes, we'll simulate a password reset process
      setTimeout(() => {
        setIsLoading(false);
        setSuccess(true);
      }, 1500);
      
      // In a real application, you would call the API:
      /*
      const response = await forgotPassword({
        email
      });
      */
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Password reset failed. Please try again.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom align="center">
        Forgot Password
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Enter your email address and we'll send you a link to reset your password
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          Password reset instructions have been sent to your email. Please check your inbox.
        </Alert>
      ) : (
        <>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!emailError}
            helperText={emailError}
            disabled={isLoading}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Send Reset Link'}
          </Button>
        </>
      )}

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="body2">
          Remember your password?{' '}
          <Link component={RouterLink} to="/auth/login" variant="body2">
            Back to login
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default ForgotPasswordPage;
