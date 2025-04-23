import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface AlertRule {
  id: string;
  name: string;
  metricType: string;
  metricName: string;
  condition: 'greater' | 'less' | 'equal';
  threshold: number;
  enabled: boolean;
  recipients: string[];
  createdAt: string;
  lastTriggered?: string;
}

export interface AlertNotification {
  id: string;
  alertRuleId: string;
  alertName: string;
  metricName: string;
  actualValue: number;
  threshold: number;
  condition: string;
  timestamp: string;
  read: boolean;
}

export interface NewAlertData {
  name: string;
  metricType: string;
  metricName: string;
  condition: 'greater' | 'less' | 'equal';
  threshold: number;
  recipients: string[];
}

export interface AlertsState {
  alertRules: AlertRule[];
  alertNotifications: AlertNotification[];
  isLoading: boolean;
  error: string | null;
  selectedAlert: AlertRule | null;
  activeOperation: 'none' | 'create' | 'update' | 'delete';
  operationSuccess: boolean;
  notificationMessage: string | null;
}

// Mock data
const mockAlertRules = [
  {
    id: 'alert001',
    name: 'High CPC Alert',
    metricType: 'cost',
    metricName: 'Cost Per Click',
    condition: 'greater',
    threshold: 2.5,
    enabled: true,
    recipients: ['marketing@example.com', 'alerts@example.com'],
    createdAt: '2025-03-15T10:30:00Z',
    lastTriggered: '2025-04-18T14:22:33Z'
  },
  {
    id: 'alert002',
    name: 'Low Conversion Rate',
    metricType: 'conversion',
    metricName: 'Conversion Rate',
    condition: 'less',
    threshold: 2.0,
    enabled: true,
    recipients: ['analytics@example.com'],
    createdAt: '2025-03-20T11:45:00Z'
  },
  {
    id: 'alert003',
    name: 'ROI Target Met',
    metricType: 'roi',
    metricName: 'Return on Ad Spend',
    condition: 'greater',
    threshold: 3.0,
    enabled: false,
    recipients: ['executives@example.com', 'investors@example.com'],
    createdAt: '2025-03-25T09:15:00Z',
    lastTriggered: '2025-04-10T16:08:45Z'
  }
] as AlertRule[];

const mockAlertNotifications = [
  {
    id: 'notif001',
    alertRuleId: 'alert001',
    alertName: 'High CPC Alert',
    metricName: 'Cost Per Click',
    actualValue: 2.73,
    threshold: 2.5,
    condition: 'greater',
    timestamp: '2025-04-18T14:22:33Z',
    read: false
  },
  {
    id: 'notif002',
    alertRuleId: 'alert003',
    alertName: 'ROI Target Met',
    metricName: 'Return on Ad Spend',
    actualValue: 3.2,
    threshold: 3.0,
    condition: 'greater',
    timestamp: '2025-04-10T16:08:45Z',
    read: true
  },
  {
    id: 'notif003',
    alertRuleId: 'alert001',
    alertName: 'High CPC Alert',
    metricName: 'Cost Per Click',
    actualValue: 2.68,
    threshold: 2.5,
    condition: 'greater',
    timestamp: '2025-04-15T11:10:22Z',
    read: true
  }
] as AlertNotification[];

// Helper functions
const generateAlertId = () => {
  const randomId = Math.floor(100 + Math.random() * 900); // 3-digit number
  return `alert${randomId}`;
};

const generateNotificationId = () => {
  const randomId = Math.floor(100 + Math.random() * 900); // 3-digit number
  return `notif${randomId}`;
};

// Async thunks
export const fetchAlerts = createAsyncThunk(
  'alerts/fetchAlerts',
  async (_, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // For now, we're just returning the mock data
      return {
        alertRules: mockAlertRules,
        alertNotifications: mockAlertNotifications
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createAlert = createAsyncThunk(
  'alerts/createAlert',
  async (alertData: NewAlertData, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate creating a new alert
      
      // Add delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newAlert: AlertRule = {
        id: generateAlertId(),
        name: alertData.name,
        metricType: alertData.metricType,
        metricName: alertData.metricName,
        condition: alertData.condition,
        threshold: alertData.threshold,
        enabled: true,
        recipients: alertData.recipients,
        createdAt: new Date().toISOString()
      };
      
      return newAlert;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleAlertStatus = createAsyncThunk(
  'alerts/toggleAlertStatus',
  async (alertId: string, { getState, rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate toggling the alert
      
      // Add delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find the alert to toggle
      const state = getState() as { alerts: AlertsState };
      const alert = state.alerts.alertRules.find(a => a.id === alertId);
      
      if (!alert) {
        throw new Error(`Alert with ID ${alertId} not found`);
      }
      
      return {
        id: alertId,
        enabled: !alert.enabled
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAlert = createAsyncThunk(
  'alerts/deleteAlert',
  async (alertId: string, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate deleting the alert
      
      // Add delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return { id: alertId };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'alerts/markNotificationAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate marking the notification as read
      
      // Add delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return { id: notificationId };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Function to check metrics against alert rules (would be called by a background process in a real app)
export const checkMetricsAgainstAlerts = createAsyncThunk(
  'alerts/checkMetricsAgainstAlerts',
  async (metrics: any, { getState, rejectWithValue }) => {
    try {
      // In a real app, this would check latest metrics against all enabled alerts
      // For demonstration, we'll create a sample notification
      
      // Add delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const state = getState() as { alerts: AlertsState };
      const enabledAlerts = state.alerts.alertRules.filter(a => a.enabled);
      
      // Sample new notifications (in a real app, this would be dynamically generated)
      const sampleNotification: AlertNotification = {
        id: generateNotificationId(),
        alertRuleId: enabledAlerts[0]?.id || 'alert001',
        alertName: enabledAlerts[0]?.name || 'High CPC Alert',
        metricName: 'Cost Per Click',
        actualValue: 2.85,
        threshold: enabledAlerts[0]?.threshold || 2.5,
        condition: enabledAlerts[0]?.condition || 'greater',
        timestamp: new Date().toISOString(),
        read: false
      };
      
      return { newNotification: sampleNotification };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState: AlertsState = {
  alertRules: [],
  alertNotifications: [],
  isLoading: false,
  error: null,
  selectedAlert: null,
  activeOperation: 'none',
  operationSuccess: false,
  notificationMessage: null
};

// Slice
const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    selectAlert(state, action: PayloadAction<AlertRule | null>) {
      state.selectedAlert = action.payload;
    },
    clearMessage(state) {
      state.notificationMessage = null;
      state.operationSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch alerts
      .addCase(fetchAlerts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.alertRules = action.payload.alertRules;
        state.alertNotifications = action.payload.alertNotifications;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create alert
      .addCase(createAlert.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.activeOperation = 'create';
      })
      .addCase(createAlert.fulfilled, (state, action) => {
        state.isLoading = false;
        state.alertRules.push(action.payload);
        state.activeOperation = 'none';
        state.operationSuccess = true;
        state.notificationMessage = `Alert "${action.payload.name}" created successfully`;
      })
      .addCase(createAlert.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.activeOperation = 'none';
        state.operationSuccess = false;
        state.notificationMessage = `Failed to create alert: ${action.payload}`;
      })
      
      // Toggle alert status
      .addCase(toggleAlertStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.activeOperation = 'update';
      })
      .addCase(toggleAlertStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        
        const index = state.alertRules.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.alertRules[index].enabled = action.payload.enabled;
          
          state.notificationMessage = `Alert ${action.payload.enabled ? 'enabled' : 'disabled'} successfully`;
        }
        
        state.activeOperation = 'none';
        state.operationSuccess = true;
      })
      .addCase(toggleAlertStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.activeOperation = 'none';
        state.operationSuccess = false;
        state.notificationMessage = `Failed to update alert: ${action.payload}`;
      })
      
      // Delete alert
      .addCase(deleteAlert.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.activeOperation = 'delete';
      })
      .addCase(deleteAlert.fulfilled, (state, action) => {
        state.isLoading = false;
        
        const index = state.alertRules.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.alertRules.splice(index, 1);
          state.notificationMessage = 'Alert deleted successfully';
        }
        
        state.activeOperation = 'none';
        state.operationSuccess = true;
      })
      .addCase(deleteAlert.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.activeOperation = 'none';
        state.operationSuccess = false;
        state.notificationMessage = `Failed to delete alert: ${action.payload}`;
      })
      
      // Mark notification as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const index = state.alertNotifications.findIndex(n => n.id === action.payload.id);
        if (index !== -1) {
          state.alertNotifications[index].read = true;
        }
      })
      
      // Check metrics against alerts
      .addCase(checkMetricsAgainstAlerts.fulfilled, (state, action) => {
        if (action.payload.newNotification) {
          state.alertNotifications.unshift(action.payload.newNotification);
          
          // Update last triggered on the alert rule
          const alertIndex = state.alertRules.findIndex(a => a.id === action.payload.newNotification.alertRuleId);
          if (alertIndex !== -1) {
            state.alertRules[alertIndex].lastTriggered = action.payload.newNotification.timestamp;
          }
        }
      });
  }
});

export const { selectAlert, clearMessage } = alertsSlice.actions;
export default alertsSlice.reducer;
