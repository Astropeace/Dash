import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Button, Box, Stack, CircularProgress,
  List, ListItem, ListItemText, Divider, TextField, Alert
} from '@mui/material';
import { useAppDispatch } from '../../src/hooks/reduxHooks'; // Assuming Redux hooks setup
import { setCredentials } from '../../src/store/slices/authSlice'; // Assuming auth slice action
import apiClient from '../../src/services/apiClient'; // Assuming an API client setup

// Placeholder types - replace with actual types from backend/shared types
interface PendingUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}
interface TenantInvitation {
  tenantId: string;
  tenantName: string;
  // Add other relevant invitation details if needed
}

const SelectTenantPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch(); // For Redux
  const [pendingUser, setPendingUser] = useState<PendingUser | null>(null);
  const [invitations, setInvitations] = useState<TenantInvitation[]>([]);
  const [newTenantName, setNewTenantName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchPendingState = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call using apiClient
        const response = await apiClient.get('/auth/pending-state');
        // Mock response for now:
        // const mockResponse = {
        //   status: 'success',
        //   data: {
        //     user: { id: 'temp-user-id', email: 'user@example.com', firstName: 'Google', lastName: 'User' },
        //     invitations: [
        //       { tenantId: 'tenant-1', tenantName: 'Existing Tenant A' },
        //       { tenantId: 'tenant-2', tenantName: 'Another Company' },
        //     ]
        //   }
        // };
        // --- End Mock ---

        if (response.status === 'success' && response.data?.user) {
          setPendingUser(response.data.user);
          setInvitations(response.data.invitations || []);
        } else {
          // No pending state, redirect to login
          navigate('/login');
        }
      } catch (err: any) {
        setError('Failed to fetch authentication state. Please try logging in again.');
        logger.error('Error fetching pending state:', err); // Use a proper logger
        // Optionally redirect to login after a delay
        // setTimeout(() => navigate('/login'), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingState();
  }, [navigate]);

  const handleJoinTenant = async (tenantId: string) => {
    setActionLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      const response = await apiClient.post('/auth/associate-tenant', { tenantId });
      // Mock response:
      // const mockResponse = {
      //   status: 'success',
      //   data: {
      //     accessToken: 'dummy-jwt-access-token',
      //     refreshToken: 'dummy-jwt-refresh-token',
      //     user: { ...pendingUser, roles: ['user'] } // Add roles from response
      //   }
      // };
      // --- End Mock ---

      if (response.status === 'success' && response.data?.accessToken) {
        // TODO: Store tokens and user data (e.g., using Redux dispatch)
        dispatch(setCredentials({ token: response.data.accessToken, user: response.data.user }));
        console.log('TODO: Store credentials', response.data);
        navigate('/dashboard'); // Redirect to dashboard
      } else {
        throw new Error('Association failed.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join tenant. Please try again.');
      logger.error('Error joining tenant:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateTenant = async () => {
    if (!newTenantName.trim()) {
      setError('Please enter a name for your new organization.');
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
       // TODO: Replace with actual API call
      const response = await apiClient.post('/auth/create-and-associate-tenant', { tenantName: newTenantName.trim() });
       // Mock response:
       // const mockResponse = {
       //  status: 'success',
       //  data: {
       //    accessToken: 'dummy-jwt-access-token-new',
       //    refreshToken: 'dummy-jwt-refresh-token-new',
       //    user: { ...pendingUser, roles: ['admin'] } // User is admin of new tenant
       //  }
       // };
      // --- End Mock ---

      if (response.status === 'success' && response.data?.accessToken) {
         // TODO: Store tokens and user data
        dispatch(setCredentials({ token: response.data.accessToken, user: response.data.user }));
        console.log('TODO: Store credentials', response.data);
        navigate('/dashboard'); // Redirect to dashboard
      } else {
        throw new Error('Tenant creation failed.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create organization. Please try again.');
      logger.error('Error creating tenant:', err);
    } finally {
      setActionLoading(false);
    }
  };


  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && !pendingUser) { // Show error prominently if initial fetch failed
     return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
         <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!pendingUser) {
    // Should have been redirected by useEffect, but as a fallback
    return null;
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {pendingUser.firstName || pendingUser.email}!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Please select an organization to continue, or create a new one.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {invitations.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Join an existing organization:</Typography>
          <List sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            {invitations.map((inv, index) => (
              <React.Fragment key={inv.tenantId}>
                <ListItem
                  secondaryAction={
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleJoinTenant(inv.tenantId)}
                      disabled={actionLoading}
                    >
                      Join
                    </Button>
                  }
                >
                  <ListItemText primary={inv.tenantName} />
                </ListItem>
                {index < invitations.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}

      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>Or create a new organization:</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            label="Organization Name"
            variant="outlined"
            fullWidth
            value={newTenantName}
            onChange={(e) => setNewTenantName(e.target.value)}
            disabled={actionLoading}
          />
          <Button
            variant="contained"
            onClick={handleCreateTenant}
            disabled={actionLoading || !newTenantName.trim()}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Create & Join'}
          </Button>
        </Stack>
      </Box>

    </Container>
  );
};

// Placeholder logger
const logger = {
  error: console.error,
  info: console.log,
  warn: console.warn,
};


export default SelectTenantPage;
