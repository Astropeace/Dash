import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface MetricsFilter {
  campaign?: string;
  channel?: string;
  startDate?: string;
  endDate?: string;
  timeRange?: string;
}

export interface MetricsState {
  data: any;
  filteredData: any;
  filters: MetricsFilter;
  isLoading: boolean;
  error: string | null;
  exportFormat: string | null;
  isExporting: boolean;
}

// Mock data (this would come from the API in a real app)
const mockMetricsData = {
  overviewMetrics: {
    totalClicks: 245879,
    totalImpressions: 3456789,
    conversionRate: 3.25,
    costPerClick: 1.37,
    costPerConversion: 42.18,
    returnOnAdSpend: 2.87,
  },
  timeSeries: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        name: 'ROI',
        data: [2.1, 2.2, 2.3, 2.5, 2.6, 2.7, 2.8, 2.9, 3.0, 3.1, 3.2, 3.3],
      },
      {
        name: 'CPC',
        data: [1.5, 1.45, 1.4, 1.35, 1.3, 1.25, 1.3, 1.35, 1.4, 1.45, 1.5, 1.55],
      },
      {
        name: 'CVR',
        data: [2.8, 2.9, 3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9],
      },
    ],
  },
  channelPerformance: [
    { name: 'Social Media', conversions: 1250, cost: 15000, roi: 3.2 },
    { name: 'Search', conversions: 980, cost: 12500, roi: 2.8 },
    { name: 'Display', conversions: 540, cost: 8500, roi: 1.9 },
    { name: 'Email', conversions: 870, cost: 5000, roi: 4.1 },
    { name: 'Referral', conversions: 320, cost: 3000, roi: 3.5 },
  ],
  deviceMetrics: [
    { name: 'Desktop', value: 45 },
    { name: 'Mobile', value: 38 },
    { name: 'Tablet', value: 17 },
  ],
  geographicData: [
    { region: 'North America', value: 42 },
    { region: 'Europe', value: 28 },
    { region: 'Asia', value: 18 },
    { region: 'South America', value: 8 },
    { region: 'Africa', value: 3 },
    { region: 'Oceania', value: 1 },
  ],
};

// Simulated filtered data based on channel
const getFilteredMetricsData = (filters: MetricsFilter) => {
  // In a real application, this would be handled by the backend
  // Here we'll just do some simple filtering for demonstration
  
  let timeSeriesData = { ...mockMetricsData.timeSeries };
  let channelData = [...mockMetricsData.channelPerformance];
  
  // Apply channel filter if specified
  if (filters.channel && filters.channel !== 'all') {
    const channelName = filters.channel === 'social' ? 'Social Media' :
                        filters.channel === 'search' ? 'Search' :
                        filters.channel === 'display' ? 'Display' :
                        filters.channel === 'email' ? 'Email' : 'Referral';
                        
    // Filter channel performance data
    channelData = channelData.filter(item => item.name === channelName);
    
    // Adjust time series data - in a real app this would be more sophisticated
    timeSeriesData.datasets.forEach(dataset => {
      // Simulate filtered data by adjusting values slightly for different channels
      dataset.data = dataset.data.map(value => {
        const multiplier = filters.channel === 'social' ? 1.1 :
                          filters.channel === 'search' ? 0.9 :
                          filters.channel === 'display' ? 0.8 :
                          filters.channel === 'email' ? 1.2 : 1.0;
        return parseFloat((value * multiplier).toFixed(2));
      });
    });
  }
  
  // Apply campaign filter
  if (filters.campaign && filters.campaign !== 'all') {
    // Simulate filtered data by adjusting values
    timeSeriesData.datasets.forEach(dataset => {
      dataset.data = dataset.data.map(value => {
        const multiplier = filters.campaign === 'summer' ? 1.15 :
                          filters.campaign === 'q2' ? 0.95 :
                          filters.campaign === 'spring' ? 1.05 :
                          filters.campaign === 'winter' ? 0.9 : 1.0;
        return parseFloat((value * multiplier).toFixed(2));
      });
    });
  }
  
  // Apply time range filter - in a real app, this would fetch different time periods
  if (filters.timeRange) {
    let monthCount = 12; // Default to yearly
    
    switch (filters.timeRange) {
      case 'day':
        monthCount = 1;
        break;
      case 'week':
        monthCount = 3;
        break;
      case 'month':
        monthCount = 6;
        break;
      case 'quarter':
        monthCount = 9;
        break;
      default:
        monthCount = 12;
    }
    
    // Limit data to the specified number of months
    timeSeriesData.labels = timeSeriesData.labels.slice(0, monthCount);
    timeSeriesData.datasets.forEach(dataset => {
      dataset.data = dataset.data.slice(0, monthCount);
    });
  }
  
  // Apply date range filter if both start and end dates are provided
  if (filters.startDate && filters.endDate) {
    // In a real app, this would be proper date filtering
    // Here we just simulate it with a simplified approach
    
    // Adjust overview metrics slightly to simulate filtered data
    const overviewMetrics = { ...mockMetricsData.overviewMetrics };
    overviewMetrics.totalClicks = Math.floor(overviewMetrics.totalClicks * 0.85);
    overviewMetrics.totalImpressions = Math.floor(overviewMetrics.totalImpressions * 0.85);
    
    return {
      ...mockMetricsData,
      overviewMetrics,
      timeSeries: timeSeriesData,
      channelPerformance: channelData
    };
  }
  
  return {
    ...mockMetricsData,
    timeSeries: timeSeriesData,
    channelPerformance: channelData
  };
};

// Async thunks
export const fetchMetrics = createAsyncThunk(
  'metrics/fetchMetrics',
  async (_, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // For now, we're just returning the mock data
      return mockMetricsData;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const applyMetricsFilters = createAsyncThunk(
  'metrics/applyFilters',
  async (filters: MetricsFilter, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call with filter params
      // For now, we'll simulate filtered data
      const filteredData = getFilteredMetricsData(filters);
      return { filteredData, filters };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const exportMetricsReport = createAsyncThunk(
  'metrics/exportReport',
  async (format: string, { getState, rejectWithValue }) => {
    try {
      // In a real app, this would call an API to generate a report file
      // For now, we'll just simulate a delay and return success
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return { success: true, format };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState: MetricsState = {
  data: null,
  filteredData: null,
  filters: {
    campaign: 'all',
    channel: 'all',
    timeRange: 'year'
  },
  isLoading: false,
  error: null,
  exportFormat: null,
  isExporting: false
};

// Slice
const metricsSlice = createSlice({
  name: 'metrics',
  initialState,
  reducers: {
    setExportFormat(state, action: PayloadAction<string>) {
      state.exportFormat = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch metrics
      .addCase(fetchMetrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.filteredData = action.payload;
      })
      .addCase(fetchMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Apply filters
      .addCase(applyMetricsFilters.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(applyMetricsFilters.fulfilled, (state, action) => {
        state.isLoading = false;
        state.filteredData = action.payload.filteredData;
        state.filters = action.payload.filters;
      })
      .addCase(applyMetricsFilters.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Export report
      .addCase(exportMetricsReport.pending, (state) => {
        state.isExporting = true;
        state.error = null;
      })
      .addCase(exportMetricsReport.fulfilled, (state, action) => {
        state.isExporting = false;
        state.exportFormat = action.payload.format;
      })
      .addCase(exportMetricsReport.rejected, (state, action) => {
        state.isExporting = false;
        state.error = action.payload as string;
      });
  }
});

export const { setExportFormat } = metricsSlice.actions;
export default metricsSlice.reducer;
