import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface DataSource {
  id: string;
  name: string;
  type: string;
  icon?: any;
  status: string;
  lastSync?: string;
  metrics?: string[];
  health?: number;
  description?: string;
}

export interface DataSourceSettings {
  apiKey: string;
  url: string;
  accountId: string;
  [key: string]: string;
}

export interface SyncHistory {
  id: string;
  dataSourceId: string;
  dataSourceName: string;
  timestamp: string;
  status: string;
  recordsProcessed: number;
  duration: string;
  message?: string;
}

export interface DataSourceSyncOptions {
  dataSourceId: string;
  fullSync: boolean;
  syncPeriod: string;
}

export interface NewDataSourceData {
  name: string;
  type: string;
  settings: DataSourceSettings;
}

export interface DataSourcesState {
  connectedSources: DataSource[];
  availableSources: Omit<DataSource, 'status' | 'lastSync' | 'metrics' | 'health'>[];
  syncHistory: SyncHistory[];
  isLoading: boolean;
  error: string | null;
  selectedDataSource: DataSource | null;
  activeOperation: 'none' | 'add' | 'sync' | 'test' | 'delete';
  operationSuccess: boolean;
  notificationMessage: string | null;
  notificationSeverity: 'success' | 'error' | 'info' | 'warning';
}

// Mock data
const mockDataSources = {
  connected: [
    {
      id: 'ds001',
      name: 'Google Analytics',
      type: 'analytics',
      status: 'active',
      lastSync: '2025-04-15T08:30:00Z',
      metrics: [
        'Visitors',
        'Page Views',
        'Bounce Rate',
        'Session Duration',
        'Traffic Source'
      ],
      health: 95,
      description: 'Main website analytics data source for campaign traffic.'
    },
    {
      id: 'ds002',
      name: 'Facebook Ads',
      type: 'advertising',
      status: 'active',
      lastSync: '2025-04-15T12:15:00Z',
      metrics: [
        'Ad Spend',
        'Impressions',
        'Clicks',
        'CTR',
        'Cost per Conversion'
      ],
      health: 100,
      description: 'Social media advertising performance data.'
    },
    {
      id: 'ds003',
      name: 'LinkedIn Campaign Manager',
      type: 'advertising',
      status: 'warning',
      lastSync: '2025-04-14T09:45:00Z',
      metrics: [
        'Impressions',
        'Clicks',
        'Engagements',
        'Follows',
        'CTR'
      ],
      health: 72,
      description: 'B2B advertising and lead generation metrics.'
    },
    {
      id: 'ds004',
      name: 'CRM Database',
      type: 'crm',
      status: 'error',
      lastSync: '2025-04-10T16:20:00Z',
      metrics: [
        'Leads',
        'Opportunities',
        'Customers',
        'Revenue',
        'Conversion Rate'
      ],
      health: 45,
      description: 'Customer relationship management data for sales tracking.'
    },
    {
      id: 'ds005',
      name: 'Twitter Analytics',
      type: 'social',
      status: 'active',
      lastSync: '2025-04-15T14:30:00Z',
      metrics: [
        'Followers',
        'Mentions',
        'Engagements',
        'Link Clicks',
        'Retweets'
      ],
      health: 98,
      description: 'Social media engagement and audience metrics.'
    }
  ],
  available: [
    {
      id: 'avail001',
      name: 'Mailchimp',
      type: 'email',
      description: 'Email marketing campaign performance and audience data.'
    },
    {
      id: 'avail002',
      name: 'HubSpot',
      type: 'crm',
      description: 'Marketing automation, lead scoring, and customer data.'
    },
    {
      id: 'avail003',
      name: 'Google Ads',
      type: 'advertising',
      description: 'Search and display advertising performance metrics.'
    },
    {
      id: 'avail004',
      name: 'Custom API',
      type: 'custom',
      description: 'Connect to any custom data source via API integration.'
    }
  ],
  syncHistory: [
    {
      id: 'sync001',
      dataSourceId: 'ds001',
      dataSourceName: 'Google Analytics',
      timestamp: '2025-04-15T08:30:00Z',
      status: 'success',
      recordsProcessed: 15423,
      duration: '00:03:22',
    },
    {
      id: 'sync002',
      dataSourceId: 'ds002',
      dataSourceName: 'Facebook Ads',
      timestamp: '2025-04-15T12:15:00Z',
      status: 'success',
      recordsProcessed: 8745,
      duration: '00:02:15',
    },
    {
      id: 'sync003',
      dataSourceId: 'ds003',
      dataSourceName: 'LinkedIn Campaign Manager',
      timestamp: '2025-04-14T09:45:00Z',
      status: 'warning',
      recordsProcessed: 5219,
      duration: '00:04:05',
      message: 'Some data points were unavailable due to API limitations'
    },
    {
      id: 'sync004',
      dataSourceId: 'ds004',
      dataSourceName: 'CRM Database',
      timestamp: '2025-04-10T16:20:00Z',
      status: 'error',
      recordsProcessed: 0,
      duration: '00:01:45',
      message: 'Connection timeout - check database credentials and firewall settings'
    },
    {
      id: 'sync005',
      dataSourceId: 'ds001',
      dataSourceName: 'Google Analytics',
      timestamp: '2025-04-14T08:30:00Z',
      status: 'success',
      recordsProcessed: 14987,
      duration: '00:03:10',
    },
    {
      id: 'sync006',
      dataSourceId: 'ds005',
      dataSourceName: 'Twitter Analytics',
      timestamp: '2025-04-15T14:30:00Z',
      status: 'success',
      recordsProcessed: 3214,
      duration: '00:01:55',
    },
  ]
};

// Helper functions
const generateDataSourceId = () => {
  const randomId = Math.floor(100 + Math.random() * 900); // 3-digit number
  return `ds${randomId}`;
};

const generateSyncId = () => {
  const randomId = Math.floor(100 + Math.random() * 900); // 3-digit number
  return `sync${randomId}`;
};

// Async thunks
export const fetchDataSources = createAsyncThunk(
  'dataSources/fetchDataSources',
  async (_, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // For now, we're just returning the mock data
      return {
        connectedSources: mockDataSources.connected,
        availableSources: mockDataSources.available,
        syncHistory: mockDataSources.syncHistory
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addDataSource = createAsyncThunk(
  'dataSources/addDataSource',
  async (dataSourceData: NewDataSourceData, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate adding a data source
      
      // Add delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a new data source
      const newDataSource: DataSource = {
        id: generateDataSourceId(),
        name: dataSourceData.name,
        type: dataSourceData.type,
        status: 'active',
        lastSync: new Date().toISOString(),
        health: 100,
        metrics: [
          'Metric 1',
          'Metric 2',
          'Metric 3',
          'Metric 4',
          'Metric 5'
        ],
        description: `Connected ${dataSourceData.name} data source`
      };
      
      return newDataSource;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const syncDataSource = createAsyncThunk(
  'dataSources/syncDataSource',
  async (syncOptions: DataSourceSyncOptions, { getState, rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate syncing a data source
      
      // Add delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Find the data source to sync
      const state = getState() as { dataSources: DataSourcesState };
      const dataSource = state.dataSources.connectedSources.find(
        ds => ds.id === syncOptions.dataSourceId
      );
      
      if (!dataSource) {
        throw new Error(`Data source with ID ${syncOptions.dataSourceId} not found`);
      }
      
      // Create a new sync history entry
      const syncHistoryEntry: SyncHistory = {
        id: generateSyncId(),
        dataSourceId: dataSource.id,
        dataSourceName: dataSource.name,
        timestamp: new Date().toISOString(),
        status: 'success',
        recordsProcessed: Math.floor(5000 + Math.random() * 10000),
        duration: `00:0${Math.floor(1 + Math.random() * 5)}:${Math.floor(10 + Math.random() * 50)}`
      };
      
      // Update the data source with new last sync time
      const updatedDataSource = {
        ...dataSource,
        lastSync: new Date().toISOString()
      };
      
      return {
        syncHistoryEntry,
        updatedDataSource
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const testDataSourceConnection = createAsyncThunk(
  'dataSources/testConnection',
  async (connectionData: DataSourceSettings, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate testing a connection
      
      // Add delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Randomly succeed or fail the test (70% success rate)
      const isSuccess = Math.random() > 0.3;
      
      if (!isSuccess) {
        throw new Error('Connection failed. Please check your credentials and try again.');
      }
      
      return { success: true };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteDataSource = createAsyncThunk(
  'dataSources/deleteDataSource',
  async (dataSourceId: string, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate deleting a data source
      
      // Add delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { id: dataSourceId };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState: DataSourcesState = {
  connectedSources: [],
  availableSources: [],
  syncHistory: [],
  isLoading: false,
  error: null,
  selectedDataSource: null,
  activeOperation: 'none',
  operationSuccess: false,
  notificationMessage: null,
  notificationSeverity: 'info'
};

// Slice
const dataSourcesSlice = createSlice({
  name: 'dataSources',
  initialState,
  reducers: {
    selectDataSource(state, action: PayloadAction<DataSource | null>) {
      state.selectedDataSource = action.payload;
    },
    clearNotification(state) {
      state.notificationMessage = null;
      state.operationSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch data sources
      .addCase(fetchDataSources.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDataSources.fulfilled, (state, action) => {
        state.isLoading = false;
        state.connectedSources = action.payload.connectedSources;
        state.availableSources = action.payload.availableSources;
        state.syncHistory = action.payload.syncHistory;
      })
      .addCase(fetchDataSources.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Add data source
      .addCase(addDataSource.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.activeOperation = 'add';
      })
      .addCase(addDataSource.fulfilled, (state, action) => {
        state.isLoading = false;
        state.connectedSources.push(action.payload);
        state.activeOperation = 'none';
        state.operationSuccess = true;
        state.notificationMessage = `Data source "${action.payload.name}" connected successfully`;
        state.notificationSeverity = 'success';
      })
      .addCase(addDataSource.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.activeOperation = 'none';
        state.operationSuccess = false;
        state.notificationMessage = `Failed to connect data source: ${action.payload}`;
        state.notificationSeverity = 'error';
      })
      
      // Sync data source
      .addCase(syncDataSource.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.activeOperation = 'sync';
      })
      .addCase(syncDataSource.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Update the sync history
        state.syncHistory.unshift(action.payload.syncHistoryEntry);
        
        // Update the data source
        const index = state.connectedSources.findIndex(
          ds => ds.id === action.payload.updatedDataSource.id
        );
        
        if (index !== -1) {
          state.connectedSources[index] = action.payload.updatedDataSource;
        }
        
        state.activeOperation = 'none';
        state.operationSuccess = true;
        state.notificationMessage = `Data source "${action.payload.updatedDataSource.name}" synced successfully`;
        state.notificationSeverity = 'success';
      })
      .addCase(syncDataSource.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.activeOperation = 'none';
        state.operationSuccess = false;
        state.notificationMessage = `Failed to sync data source: ${action.payload}`;
        state.notificationSeverity = 'error';
      })
      
      // Test connection
      .addCase(testDataSourceConnection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.activeOperation = 'test';
      })
      .addCase(testDataSourceConnection.fulfilled, (state) => {
        state.isLoading = false;
        state.activeOperation = 'none';
        state.operationSuccess = true;
        state.notificationMessage = 'Connection successful! The credentials are valid.';
        state.notificationSeverity = 'success';
      })
      .addCase(testDataSourceConnection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.activeOperation = 'none';
        state.operationSuccess = false;
        state.notificationMessage = `${action.payload}`;
        state.notificationSeverity = 'error';
      })
      
      // Delete data source
      .addCase(deleteDataSource.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.activeOperation = 'delete';
      })
      .addCase(deleteDataSource.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Remove the data source
        const index = state.connectedSources.findIndex(
          ds => ds.id === action.payload.id
        );
        
        if (index !== -1) {
          const dataSourceName = state.connectedSources[index].name;
          state.connectedSources.splice(index, 1);
          
          state.notificationMessage = `Data source "${dataSourceName}" disconnected successfully`;
        } else {
          state.notificationMessage = 'Data source disconnected successfully';
        }
        
        state.activeOperation = 'none';
        state.operationSuccess = true;
        state.notificationSeverity = 'success';
      })
      .addCase(deleteDataSource.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.activeOperation = 'none';
        state.operationSuccess = false;
        state.notificationMessage = `Failed to disconnect data source: ${action.payload}`;
        state.notificationSeverity = 'error';
      });
  }
});

export const { selectDataSource, clearNotification } = dataSourcesSlice.actions;
export default dataSourcesSlice.reducer;
