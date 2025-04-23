import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Report {
  id: string;
  name: string;
  type: string;
  lastRun?: string;
  scheduledFrequency?: string;
  nextRun?: string;
  recipients?: string[];
  format?: string;
  status: string;
  created?: string;
  creator?: string;
}

export interface NewReportData {
  name: string;
  type: string;
  format: string[];
  components?: string[];
}

export interface ScheduleReportData {
  id: string;
  frequency: string;
  recipients: string[];
  active: boolean;
}

export interface ExportReportData {
  id: string;
  format: string;
}

export interface ReportsState {
  predefinedReports: Report[];
  customReports: Report[];
  isLoading: boolean;
  error: string | null;
  selectedReport: Report | null;
  activeOperation: 'none' | 'create' | 'schedule' | 'export' | 'run';
  operationSuccess: boolean;
  notificationMessage: string | null;
}

// Mock data
const mockReportsData = {
  predefinedReports: [
    {
      id: 'r001',
      name: 'Campaign Performance Overview',
      type: 'performance',
      lastRun: '2025-04-15T08:23:12Z',
      scheduledFrequency: 'Weekly',
      nextRun: '2025-04-22T08:00:00Z',
      recipients: ['marketing@example.com', 'analytics@example.com'],
      format: 'PDF, Excel',
      status: 'active'
    },
    {
      id: 'r002',
      name: 'ROI Analysis by Channel',
      type: 'roi',
      lastRun: '2025-04-12T14:10:45Z',
      scheduledFrequency: 'Monthly',
      nextRun: '2025-05-12T14:00:00Z',
      recipients: ['executives@example.com', 'finance@example.com'],
      format: 'PDF',
      status: 'active'
    },
    {
      id: 'r003',
      name: 'Investor Engagement Metrics',
      type: 'engagement',
      lastRun: '2025-04-01T09:30:00Z',
      scheduledFrequency: 'Monthly',
      nextRun: '2025-05-01T09:30:00Z',
      recipients: ['investors@example.com', 'relations@example.com'],
      format: 'PDF, CSV',
      status: 'active'
    },
    {
      id: 'r004',
      name: 'Quarterly Financial Summary',
      type: 'financial',
      lastRun: '2025-03-31T16:45:22Z',
      scheduledFrequency: 'Quarterly',
      nextRun: '2025-06-30T16:45:00Z',
      recipients: ['cfo@example.com', 'accounting@example.com'],
      format: 'PDF, Excel',
      status: 'active'
    },
    {
      id: 'r005',
      name: 'Conversion Funnel Analysis',
      type: 'conversion',
      lastRun: '2025-04-10T11:15:33Z',
      scheduledFrequency: 'Weekly',
      nextRun: '2025-04-17T11:15:00Z',
      recipients: ['marketing@example.com', 'sales@example.com'],
      format: 'PDF',
      status: 'paused'
    }
  ],
  customReports: [
    {
      id: 'cr001',
      name: 'Custom Campaign Metrics Report',
      type: 'custom',
      created: '2025-03-22T10:20:00Z',
      lastRun: '2025-04-14T08:30:00Z',
      scheduledFrequency: 'None',
      creator: 'John Smith',
      format: 'PDF, Excel',
      status: 'draft'
    },
    {
      id: 'cr002',
      name: 'Regional Investor Distribution',
      type: 'custom',
      created: '2025-02-15T14:45:00Z',
      lastRun: '2025-04-05T16:20:00Z',
      scheduledFrequency: 'Monthly',
      creator: 'Emma Davis',
      format: 'PDF',
      status: 'active'
    }
  ]
};

// Helper functions
const generateReportId = (isCustom: boolean) => {
  const prefix = isCustom ? 'cr' : 'r';
  const randomId = Math.floor(100 + Math.random() * 900); // 3-digit number
  return `${prefix}${randomId}`;
};

// Async thunks
export const fetchReports = createAsyncThunk(
  'reports/fetchReports',
  async (_, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // For now, we're just returning the mock data
      return mockReportsData;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createReport = createAsyncThunk(
  'reports/createReport',
  async (reportData: NewReportData, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate creating a new report
      
      // Add delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newReport: Report = {
        id: generateReportId(reportData.type === 'custom'),
        name: reportData.name,
        type: reportData.type,
        created: new Date().toISOString(),
        lastRun: new Date().toISOString(),
        format: reportData.format.join(', '),
        status: 'draft',
        creator: 'Current User'
      };
      
      return newReport;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const scheduleReport = createAsyncThunk(
  'reports/scheduleReport',
  async (scheduleData: ScheduleReportData, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate scheduling a report
      
      // Add delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Format frequency for display
      const formattedFrequency = scheduleData.frequency.charAt(0).toUpperCase() + scheduleData.frequency.slice(1);
      
      // Calculate next run date based on frequency
      const now = new Date();
      let nextRun = new Date();
      
      switch(scheduleData.frequency) {
        case 'daily':
          nextRun.setDate(now.getDate() + 1);
          break;
        case 'weekly':
          nextRun.setDate(now.getDate() + 7);
          break;
        case 'biweekly':
          nextRun.setDate(now.getDate() + 14);
          break;
        case 'monthly':
          nextRun.setMonth(now.getMonth() + 1);
          break;
        case 'quarterly':
          nextRun.setMonth(now.getMonth() + 3);
          break;
        default:
          nextRun = new Date(0); // No schedule
      }
      
      return {
        id: scheduleData.id,
        scheduledFrequency: formattedFrequency,
        nextRun: nextRun.toISOString(),
        recipients: scheduleData.recipients,
        status: scheduleData.active ? 'active' : 'paused'
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const runReport = createAsyncThunk(
  'reports/runReport',
  async (reportId: string, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call to execute the report
      // For now, we'll simulate running a report
      
      // Add delay to simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        id: reportId,
        lastRun: new Date().toISOString()
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const exportReport = createAsyncThunk(
  'reports/exportReport',
  async (exportData: ExportReportData, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call to generate the export file
      // For now, we'll simulate exporting
      
      // Add delay to simulate export generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        id: exportData.id,
        format: exportData.format,
        exportedAt: new Date().toISOString()
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState: ReportsState = {
  predefinedReports: [],
  customReports: [],
  isLoading: false,
  error: null,
  selectedReport: null,
  activeOperation: 'none',
  operationSuccess: false,
  notificationMessage: null
};

// Slice
const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    selectReport(state, action: PayloadAction<Report | null>) {
      state.selectedReport = action.payload;
    },
    clearNotification(state) {
      state.notificationMessage = null;
      state.operationSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch reports
      .addCase(fetchReports.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.isLoading = false;
        state.predefinedReports = action.payload.predefinedReports;
        state.customReports = action.payload.customReports;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create report
      .addCase(createReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.activeOperation = 'create';
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Add the new report to the appropriate list
        if (action.payload.id.startsWith('cr')) {
          state.customReports.push(action.payload);
        } else {
          state.predefinedReports.push(action.payload);
        }
        
        state.activeOperation = 'none';
        state.operationSuccess = true;
        state.notificationMessage = `Report "${action.payload.name}" created successfully`;
      })
      .addCase(createReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.activeOperation = 'none';
        state.operationSuccess = false;
        state.notificationMessage = `Failed to create report: ${action.payload}`;
      })
      
      // Schedule report
      .addCase(scheduleReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.activeOperation = 'schedule';
      })
      .addCase(scheduleReport.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Update the report in the appropriate list
        const reportToUpdate = action.payload;
        
        // Check predefined reports
        const predefinedIndex = state.predefinedReports.findIndex(r => r.id === reportToUpdate.id);
        if (predefinedIndex !== -1) {
          state.predefinedReports[predefinedIndex] = {
            ...state.predefinedReports[predefinedIndex],
            ...reportToUpdate
          };
        } else {
          // Check custom reports
          const customIndex = state.customReports.findIndex(r => r.id === reportToUpdate.id);
          if (customIndex !== -1) {
            state.customReports[customIndex] = {
              ...state.customReports[customIndex],
              ...reportToUpdate
            };
          }
        }
        
        state.activeOperation = 'none';
        state.operationSuccess = true;
        state.notificationMessage = `Report schedule updated successfully`;
      })
      .addCase(scheduleReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.activeOperation = 'none';
        state.operationSuccess = false;
        state.notificationMessage = `Failed to schedule report: ${action.payload}`;
      })
      
      // Run report
      .addCase(runReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.activeOperation = 'run';
      })
      .addCase(runReport.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Update the report's last run time
        const reportUpdate = action.payload;
        
        // Check predefined reports
        const predefinedIndex = state.predefinedReports.findIndex(r => r.id === reportUpdate.id);
        if (predefinedIndex !== -1) {
          state.predefinedReports[predefinedIndex] = {
            ...state.predefinedReports[predefinedIndex],
            lastRun: reportUpdate.lastRun
          };
        } else {
          // Check custom reports
          const customIndex = state.customReports.findIndex(r => r.id === reportUpdate.id);
          if (customIndex !== -1) {
            state.customReports[customIndex] = {
              ...state.customReports[customIndex],
              lastRun: reportUpdate.lastRun
            };
          }
        }
        
        state.activeOperation = 'none';
        state.operationSuccess = true;
        state.notificationMessage = `Report executed successfully`;
      })
      .addCase(runReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.activeOperation = 'none';
        state.operationSuccess = false;
        state.notificationMessage = `Failed to run report: ${action.payload}`;
      })
      
      // Export report
      .addCase(exportReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.activeOperation = 'export';
      })
      .addCase(exportReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeOperation = 'none';
        state.operationSuccess = true;
        state.notificationMessage = `Report exported successfully as ${action.payload.format}`;
      })
      .addCase(exportReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.activeOperation = 'none';
        state.operationSuccess = false;
        state.notificationMessage = `Failed to export report: ${action.payload}`;
      });
  }
});

export const { selectReport, clearNotification } = reportsSlice.actions;
export default reportsSlice.reducer;
