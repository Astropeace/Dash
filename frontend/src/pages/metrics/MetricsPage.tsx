import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../store';
import {
  fetchMetrics,
  applyMetricsFilters,
  exportMetricsReport,
  MetricsFilter
} from '../../store/slices/metricsSlice';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Divider,
  CircularProgress,
  useTheme,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  TextField,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  Label,
} from 'recharts';

// Mock data for metrics
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

// Simple chart component for visualization (placeholder)
const SimpleLineChart: React.FC<{ data: any }> = ({ data }) => {
  const theme = useTheme();
  const height = 300;
  const maxValue = Math.max(...data.datasets.map((d: any) => Math.max(...d.data)));
  
  return (
    <Box sx={{ height: `${height}px`, position: 'relative', mt: 2 }}>
      {/* X-axis labels */}
      <Box sx={{ position: 'absolute', bottom: 0, width: '100%', display: 'flex' }}>
        {data.labels.map((label: string, i: number) => (
          <Box 
            key={i} 
            sx={{ 
              flex: 1, 
              textAlign: 'center', 
              fontSize: '0.7rem',
              color: theme.palette.text.secondary
            }}
          >
            {label}
          </Box>
        ))}
      </Box>
      
      {/* Chart lines */}
      <Box sx={{ position: 'absolute', bottom: 20, top: 20, width: '100%' }}>
        {data.datasets.map((dataset: any, datasetIndex: number) => {
          const colors = [
            theme.palette.primary.main,
            theme.palette.secondary.main,
            theme.palette.info.main,
            theme.palette.success.main,
            theme.palette.warning.main,
          ];
          
          return (
            <Box 
              key={datasetIndex} 
              sx={{ 
                position: 'absolute', 
                bottom: 0, 
                top: 0, 
                width: '100%',
                display: 'flex',
                alignItems: 'flex-end',
              }}
            >
              {dataset.data.map((value: number, i: number) => {
                const nextValue = dataset.data[i + 1] || value;
                const barHeight = (value / maxValue) * (height - 40);
                const nextBarHeight = (nextValue / maxValue) * (height - 40);
                
                if (i < dataset.data.length - 1) {
                  return (
                    <Box 
                      key={i} 
                      sx={{ 
                        position: 'absolute',
                        left: `${(i / dataset.data.length) * 100}%`,
                        width: `${(1 / dataset.data.length) * 100}%`,
                        height: '100%',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          height: `${barHeight}px`,
                          width: '100%',
                          display: 'flex',
                          alignItems: 'flex-end',
                        }}
                      >
                        <Box
                          sx={{
                            width: '100%',
                            borderTop: `2px solid ${colors[datasetIndex % colors.length]}`,
                            transform: `rotate(${Math.atan2(nextBarHeight - barHeight, 100)}rad)`,
                            transformOrigin: 'left bottom',
                          }}
                        />
                      </Box>
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 0,
                          bottom: `${barHeight}px`,
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          bgcolor: colors[datasetIndex % colors.length],
                          transform: 'translate(-3px, 3px)',
                        }}
                      />
                    </Box>
                  );
                }
                return null;
              })}
            </Box>
          );
        })}
      </Box>
      
      {/* Legend */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 0, 
          right: 0, 
          display: 'flex', 
          alignItems: 'center',
          gap: 2
        }}
      >
        {data.datasets.map((dataset: any, i: number) => {
          const colors = [
            theme.palette.primary.main,
            theme.palette.secondary.main,
            theme.palette.info.main,
            theme.palette.success.main,
            theme.palette.warning.main,
          ];
          
          return (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: colors[i % colors.length],
                  borderRadius: '2px',
                }}
              />
              <Typography variant="caption">{dataset.name}</Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

// Bar chart component (custom implementation)
const SimpleBarChart: React.FC<{ data: any[]; labelKey: string; valueKey: string }> = ({ 
  data, 
  labelKey, 
  valueKey 
}) => {
  const theme = useTheme();
  
  const maxValue = Math.max(...data.map(item => item[valueKey]));
  
  return (
    <Box sx={{ height: '300px', display: 'flex', flexDirection: 'column', mt: 2 }}>
      <Box sx={{ display: 'flex', flexGrow: 1, alignItems: 'flex-end' }}>
        {data.map((item, index) => (
          <Box
            key={index}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
              justifyContent: 'flex-end',
              px: 1,
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: `${(item[valueKey] / maxValue) * 100}%`,
                backgroundColor: theme.palette.primary.main,
                borderRadius: '4px 4px 0 0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                minHeight: '30px',
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  color: theme.palette.primary.contrastText,
                  mt: 0.5,
                  fontWeight: 'bold'
                }}
              >
                {item[valueKey]}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', mt: 1, mb: 2 }}>
        {data.map((item, index) => (
          <Box
            key={index}
            sx={{
              flex: 1,
              textAlign: 'center',
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                color: theme.palette.text.secondary,
                display: 'block',
                fontSize: '0.7rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {item[labelKey]}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// Metrics tabs
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`metrics-tabpanel-${index}`}
      aria-labelledby={`metrics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const MetricsPage: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { 
    filteredData, 
    filters, 
    isLoading, 
    isExporting,
    error
  } = useSelector((state: RootState) => state.metrics);
  
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState(filters.timeRange || 'year');
  const [startDate, setStartDate] = useState(filters.startDate || '');
  const [endDate, setEndDate] = useState(filters.endDate || '');
  const [showFilters, setShowFilters] = useState(false);
  const [campaignFilter, setCampaignFilter] = useState(filters.campaign || 'all');
  const [channelFilter, setChannelFilter] = useState(filters.channel || 'all');
  
  // Fetch metrics data on component mount
  useEffect(() => {
    void dispatch(fetchMetrics());
  }, [dispatch]);
  
  // Handle refresh
  const handleRefresh = () => {
    void dispatch(fetchMetrics());
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value}%`;
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle time range change
  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    const newTimeRange = event.target.value;
    setTimeRange(newTimeRange);
    
    // Apply filters
    const updatedFilters: MetricsFilter = {
      ...filters,
      timeRange: newTimeRange
    };
    
    void dispatch(applyMetricsFilters(updatedFilters));
  };

  // Handle campaign filter change
  const handleCampaignFilterChange = (event: SelectChangeEvent) => {
    const newCampaign = event.target.value;
    setCampaignFilter(newCampaign);
    
    // Apply filters
    const updatedFilters: MetricsFilter = {
      ...filters,
      campaign: newCampaign
    };
    
    void dispatch(applyMetricsFilters(updatedFilters));
  };

  // Handle channel filter change
  const handleChannelFilterChange = (event: SelectChangeEvent) => {
    const newChannel = event.target.value;
    setChannelFilter(newChannel);
    
    // Apply filters
    const updatedFilters: MetricsFilter = {
      ...filters,
      channel: newChannel
    };
    
    void dispatch(applyMetricsFilters(updatedFilters));
  };
  
  // Handle date filter changes
  const handleDateFilterApply = () => {
    if (startDate && endDate) {
      // Apply filters with date range
      const updatedFilters: MetricsFilter = {
        ...filters,
        startDate,
        endDate
      };
      
      void dispatch(applyMetricsFilters(updatedFilters));
    }
  };
  
  // Handle export
  const handleExport = () => {
    void dispatch(exportMetricsReport('pdf'));
  };

  // Metric card component
  interface MetricCardProps {
    title: string;
    value: string | number;
    description?: string;
    info?: string;
    color?: string;
  }

  const MetricCard: React.FC<MetricCardProps> = ({ title, value, description, info, color }) => {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            {info && (
              <Tooltip title={info}>
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color }}>
            {value}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {description}
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Metrics</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            variant={showFilters ? 'contained' : 'outlined'}
            size="small"
          >
            Filters
          </Button>
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            variant="outlined"
            size="small"
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            startIcon={<DownloadIcon />}
            variant="outlined"
            size="small"
            onClick={handleExport}
            disabled={isExporting}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Filters section */}
      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl size="small" fullWidth>
                <InputLabel id="campaign-filter-label">Campaign</InputLabel>
                <Select
                  labelId="campaign-filter-label"
                  id="campaign-filter"
                  value={campaignFilter}
                  label="Campaign"
                  onChange={handleCampaignFilterChange}
                >
                  <MenuItem value="all">All Campaigns</MenuItem>
                  <MenuItem value="summer">Summer Social Media Blitz</MenuItem>
                  <MenuItem value="q2">Q2 Search Campaign</MenuItem>
                  <MenuItem value="spring">Spring Email Newsletter</MenuItem>
                  <MenuItem value="winter">Winter Holiday Special</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl size="small" fullWidth>
                <InputLabel id="channel-filter-label">Channel</InputLabel>
                <Select
                  labelId="channel-filter-label"
                  id="channel-filter"
                  value={channelFilter}
                  label="Channel"
                  onChange={handleChannelFilterChange}
                >
                  <MenuItem value="all">All Channels</MenuItem>
                  <MenuItem value="social">Social Media</MenuItem>
                  <MenuItem value="search">Search</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="display">Display</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                size="small"
                fullWidth
                placeholder="YYYY-MM-DD"
                InputProps={{
                  endAdornment: (
                    <IconButton size="small">
                      <CalendarIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                size="small"
                fullWidth
                placeholder="YYYY-MM-DD"
                InputProps={{
                  endAdornment: (
                    <IconButton size="small">
                      <CalendarIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} display="flex" justifyContent="flex-end" mt={1}>
              <Button 
                variant="contained" 
                size="small" 
                onClick={handleDateFilterApply}
                disabled={!startDate || !endDate}
              >
                Apply Date Filter
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Overview metrics */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <MetricCard
                title="Total Clicks"
                value={mockMetricsData.overviewMetrics.totalClicks.toLocaleString()}
                color={theme.palette.primary.main}
                info="Total number of clicks across all campaigns"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <MetricCard
                title="Total Impressions"
                value={mockMetricsData.overviewMetrics.totalImpressions.toLocaleString()}
                color={theme.palette.secondary.main}
                info="Total number of impressions across all campaigns"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <MetricCard
                title="Conversion Rate"
                value={formatPercentage(mockMetricsData.overviewMetrics.conversionRate)}
                color={theme.palette.info.main}
                info="Percentage of clicks that resulted in conversions"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <MetricCard
                title="Cost Per Click"
                value={formatCurrency(mockMetricsData.overviewMetrics.costPerClick)}
                color={theme.palette.warning.main}
                info="Average cost for each click"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <MetricCard
                title="Cost Per Conversion"
                value={formatCurrency(mockMetricsData.overviewMetrics.costPerConversion)}
                color={theme.palette.error.main}
                info="Average cost for each conversion"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <MetricCard
                title="ROAS"
                value={mockMetricsData.overviewMetrics.returnOnAdSpend.toFixed(2) + 'x'}
                color={theme.palette.success.main}
                info="Return on ad spend"
              />
            </Grid>
          </Grid>

          {/* Tabs for different metric views */}
          <Paper sx={{ width: '100%', borderRadius: 1 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="metrics tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Performance Trends" />
                <Tab label="Channel Comparison" />
                <Tab label="Device Breakdown" />
                <Tab label="Geographic Distribution" />
              </Tabs>
            </Box>

            {/* Time range selector - common for all tabs */}
            <Box sx={{ px: 2, pt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="time-range-label">Time Range</InputLabel>
                <Select
                  labelId="time-range-label"
                  id="time-range"
                  value={timeRange}
                  label="Time Range"
                  onChange={handleTimeRangeChange}
                >
                  <MenuItem value="day">Last 24 Hours</MenuItem>
                  <MenuItem value="week">Last 7 Days</MenuItem>
                  <MenuItem value="month">Last 30 Days</MenuItem>
                  <MenuItem value="quarter">Last 90 Days</MenuItem>
                  <MenuItem value="year">Last 12 Months</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Performance Trends Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ p: 2 }}>
                <Card>
                  <CardHeader title="Performance Over Time" />
                  <Divider />
                  <CardContent>
                    {/* Convert mockMetricsData.timeSeries to a format Recharts can use */}
                    {(() => {
                      // Transform data structure for the line chart
                      const chartData = mockMetricsData.timeSeries.labels.map((month, i) => {
                        const dataPoint: any = { month };
                        mockMetricsData.timeSeries.datasets.forEach(ds => {
                          dataPoint[ds.name] = ds.data[i];
                        });
                        return dataPoint;
                      });

                      const colors = [
                        theme.palette.primary.main,
                        theme.palette.secondary.main,
                        theme.palette.info.main,
                      ];

                      return (
                        <ResponsiveContainer width="100%" height={350}>
                          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <RechartsTooltip formatter={(value: any) => value.toFixed(2)} />
                            <Legend />
                            {mockMetricsData.timeSeries.datasets.map((dataset, index) => (
                              <Line
                                key={dataset.name}
                                type="monotone"
                                dataKey={dataset.name}
                                stroke={colors[index % colors.length]}
                                activeDot={{ r: 8 }}
                                strokeWidth={2}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      );
                    })()}
                  </CardContent>
                </Card>
              </Box>
            </TabPanel>

            {/* Channel Comparison Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ p: 2 }}>
                <Card>
                  <CardHeader title="Channel Performance" />
                  <Divider />
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart
                        data={mockMetricsData.channelPerformance}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip formatter={(value: any) => value.toFixed(2) + 'x'} />
                        <Legend />
                        <Bar 
                          dataKey="roi" 
                          fill={theme.palette.primary.main} 
                          name="ROI" 
                          label={{ position: 'top', fill: theme.palette.text.primary }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      Channel Details
                    </Typography>
                    <Grid container spacing={2}>
                      {mockMetricsData.channelPerformance.map((channel, index) => (
                        <Grid item xs={12} md={6} key={index}>
                          <Box sx={{ 
                            p: 2, 
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <Box>
                              <Typography variant="subtitle2">{channel.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {channel.conversions} conversions
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="subtitle2" color="primary">
                                {formatCurrency(channel.cost)}
                              </Typography>
                              <Typography variant="body2" color={channel.roi >= 2.5 ? 'success.main' : 'warning.main'}>
                                ROI: {channel.roi.toFixed(1)}x
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Box>
            </TabPanel>

            {/* Device Breakdown Tab */}
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ p: 2 }}>
                <Card>
                  <CardHeader title="Device Distribution" />
                  <Divider />
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: 300,
                    }}>
                      {/* Simple pie chart visualization */}
                      <Box sx={{ 
                        display: 'flex', 
                        position: 'relative',
                        width: 200,
                        height: 200,
                      }}>
                        {mockMetricsData.deviceMetrics.map((device, index) => {
                          let startAngle = 0;
                          
                          mockMetricsData.deviceMetrics.slice(0, index).forEach(d => {
                            startAngle += (d.value / 100) * 360;
                          });
                          
                          const angle = (device.value / 100) * 360;
                          
                          const colors = [
                            theme.palette.primary.main,
                            theme.palette.secondary.main,
                            theme.palette.info.main,
                          ];

                          return (
                            <Box
                              key={device.name}
                              sx={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                background: `conic-gradient(${colors[index]} ${startAngle}deg, ${colors[index]} ${startAngle + angle}deg, transparent ${startAngle + angle}deg)`,
                              }}
                            />
                          );
                        })}
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
                      {mockMetricsData.deviceMetrics.map((device, index) => {
                        const colors = [
                          theme.palette.primary.main,
                          theme.palette.secondary.main,
                          theme.palette.info.main,
                        ];
                        
                        return (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                borderRadius: '4px',
                                backgroundColor: colors[index],
                              }}
                            />
                            <Typography>
                              {device.name}: {device.value}%
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </TabPanel>

            {/* Geographic Distribution Tab */}
            <TabPanel value={tabValue} index={3}>
              <Box sx={{ p: 2 }}>
                <Card>
                  <CardHeader title="Geographic Distribution" />
                  <Divider />
                  <CardContent>
                    {/* Use Recharts to create a horizontal bar chart */}
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart
                        data={mockMetricsData.geographicData}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis 
                          dataKey="region" 
                          type="category" 
                          width={100}
                          tick={{ fontSize: 12 }}
                        />
                        <RechartsTooltip />
                        <Bar 
                          dataKey="value" 
                          fill={theme.palette.primary.main} 
                          name="Distribution %" 
                          label={{ 
                            position: 'right', 
                            formatter: (value: any) => `${value}%`,
                            fill: theme.palette.text.primary
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Box>
            </TabPanel>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default MetricsPage;
