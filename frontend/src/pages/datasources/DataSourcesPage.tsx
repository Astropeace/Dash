import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import {
  fetchDataSources,
  addDataSource,
  syncDataSource,
  testDataSourceConnection,
  deleteDataSource,
  selectDataSource,
  clearNotification,
  NewDataSourceData,
  DataSourceSyncOptions,
  DataSource,
  DataSourceSettings
} from '../../store/slices/dataSourcesSlice';
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Storage as StorageIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Code as CodeIcon,
  Link as LinkIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Sync as SyncIcon,
  Settings as SettingsIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Visibility as VisibilityIcon,
  Help as HelpIcon,
  Close as CloseIcon,
  NetworkCheck as NetworkCheckIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

// Mock data for data sources
const mockDataSources = {
  connected: [
    {
      id: 'ds001',
      name: 'Google Analytics',
      type: 'analytics',
      icon: <GoogleIcon />,
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
      icon: <FacebookIcon />,
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
      icon: <LinkedInIcon />,
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
      icon: <StorageIcon />,
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
      icon: <TwitterIcon />,
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
      icon: <CodeIcon />,
      description: 'Email marketing campaign performance and audience data.'
    },
    {
      id: 'avail002',
      name: 'HubSpot',
      type: 'crm',
      icon: <StorageIcon />,
      description: 'Marketing automation, lead scoring, and customer data.'
    },
    {
      id: 'avail003',
      name: 'Google Ads',
      type: 'advertising',
      icon: <GoogleIcon />,
      description: 'Search and display advertising performance metrics.'
    },
    {
      id: 'avail004',
      name: 'Custom API',
      type: 'custom',
      icon: <LinkIcon />,
      description: 'Connect to any custom data source via API integration.'
    }
  ]
};

// Mock sync history data
const mockSyncHistory = [
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
];

// Data source types
const dataSourceTypes = [
  { value: 'analytics', label: 'Analytics' },
  { value: 'advertising', label: 'Advertising' },
  { value: 'crm', label: 'CRM' },
  { value: 'email', label: 'Email Marketing' },
  { value: 'social', label: 'Social Media' },
  { value: 'custom', label: 'Custom' },
];

// Status styles
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusIcon = (status: string): React.ReactElement | undefined => {
  switch (status) {
    case 'active':
    case 'success':
      return <CheckIcon fontSize="small" color="success" />;
    case 'warning':
      return <WarningIcon fontSize="small" color="warning" />;
    case 'error':
      return <ErrorIcon fontSize="small" color="error" />;
    default:
      return undefined;
  }
};

// Tab Panel component
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
      id={`datasources-tabpanel-${index}`}
      aria-labelledby={`datasources-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

// Data sources page component
const DataSourcesPage: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<any>();
  const { 
    connectedSources, 
    availableSources,
    syncHistory,
    isLoading, 
    selectedDataSource: reduxSelectedDataSource,
    activeOperation,
    operationSuccess,
    notificationMessage,
    notificationSeverity
  } = useSelector((state: RootState) => state.dataSources);
  
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [newDataSourceType, setNewDataSourceType] = useState('');
  const [newDataSourceName, setNewDataSourceName] = useState('');
  const [newDataSourceSettings, setNewDataSourceSettings] = useState<DataSourceSettings>({
    apiKey: '',
    url: '',
    accountId: '',
  });
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [syncOptions, setSyncOptions] = useState<DataSourceSyncOptions>({
    dataSourceId: '',
    fullSync: false,
    syncPeriod: '30',
  });
  
  // Local notification state (will use Redux notification state later)
  const [notification, setNotification] = useState<{
    open: boolean,
    message: string,
    severity: 'success' | 'error' | 'info' | 'warning'
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Test connection state
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  
  // Fetch data sources on component mount
  useEffect(() => {
    dispatch(fetchDataSources());
  }, [dispatch]);

  // Format timestamp
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Refresh data sources
  const handleRefresh = () => {
    dispatch(fetchDataSources());
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Open add data source dialog
  const handleAddDataSource = () => {
    setNewDataSourceType('');
    setNewDataSourceName('');
    setNewDataSourceSettings({
      apiKey: '',
      url: '',
      accountId: '',
    });
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle data source type change
  const handleDataSourceTypeChange = (event: SelectChangeEvent) => {
    setNewDataSourceType(event.target.value);
  };

  // Handle data source form submission
  const handleAddDataSourceSubmit = () => {
    const newDataSourceData: NewDataSourceData = {
      name: newDataSourceName,
      type: newDataSourceType,
      settings: newDataSourceSettings
    };
    
    // Close dialog and dispatch action
    setOpenDialog(false);
    dispatch(addDataSource(newDataSourceData));
  };

  // Handle manual sync
  const handleSyncDataSource = (dataSource: any) => {
    setSelectedDataSource(dataSource);
    setSyncOptions({
      dataSourceId: dataSource.id,
      fullSync: false,
      syncPeriod: '30',
    });
    setSyncDialogOpen(true);
  };

  // Handle sync dialog close
  const handleCloseSyncDialog = () => {
    setSyncDialogOpen(false);
  };

  // Handle sync form submission
  const handleSyncSubmit = () => {
    if (selectedDataSource) {
      const syncData: DataSourceSyncOptions = {
        dataSourceId: selectedDataSource.id,
        fullSync: syncOptions.fullSync,
        syncPeriod: syncOptions.syncPeriod
      };
      
      // Close dialog and dispatch action
      setSyncDialogOpen(false);
      dispatch(syncDataSource(syncData));
    }
  };

  return (
    <Box>
      {/* Notification */}
      {notification.open && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            minWidth: 300,
            maxWidth: 500,
            boxShadow: 3,
            borderRadius: 1,
            bgcolor: 
              notification.severity === 'success' ? theme.palette.success.main :
              notification.severity === 'error' ? theme.palette.error.main :
              notification.severity === 'warning' ? theme.palette.warning.main :
              theme.palette.info.main,
            color: '#fff',
            p: 2,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {notification.severity === 'success' && <CheckIcon sx={{ mr: 1.5 }} />}
          {notification.severity === 'error' && <ErrorIcon sx={{ mr: 1.5 }} />}
          {notification.severity === 'warning' && <WarningIcon sx={{ mr: 1.5 }} />}
          {notification.severity === 'info' && <InfoIcon sx={{ mr: 1.5 }} />}
          
          <Typography sx={{ flex: 1 }}>{notification.message}</Typography>
          
          <IconButton 
            size="small" 
            onClick={() => setNotification(prev => ({ ...prev, open: false }))}
            sx={{ color: 'white', ml: 1 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Data Sources</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddDataSource}
            variant="contained"
            size="small"
          >
            Add Data Source
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
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ width: '100%', borderRadius: 1 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="data sources tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Connected Sources" />
              <Tab label="Available Integrations" />
              <Tab label="Sync History" />
              <Tab label="Settings" />
            </Tabs>
          </Box>

          {/* Connected Sources Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Manage your connected data sources and their status
              </Typography>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                {mockDataSources.connected.map((dataSource) => (
                  <Grid item xs={12} md={6} key={dataSource.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Box 
                              sx={{ 
                                p: 1, 
                                borderRadius: 1, 
                                bgcolor: theme.palette.action.selected,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {dataSource.icon}
                            </Box>
                            <Box>
                              <Typography variant="h6">{dataSource.name}</Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                                {dataSource.type}
                              </Typography>
                            </Box>
                          </Box>
                          <Chip 
                            label={dataSource.status.charAt(0).toUpperCase() + dataSource.status.slice(1)}
                            size="small"
                            color={getStatusColor(dataSource.status) as any}
                            icon={getStatusIcon(dataSource.status)}
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {dataSource.description}
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Health: {dataSource.health}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={dataSource.health} 
                            color={
                              dataSource.health > 80 ? 'success' : 
                              dataSource.health > 50 ? 'warning' : 'error'
                            }
                            sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                          />
                        </Box>
                        
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 2 }}>
                          Last synced: {formatDate(dataSource.lastSync)}
                        </Typography>
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                          Available Metrics
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {dataSource.metrics.map((metric, index) => (
                            <Chip 
                              key={index} 
                              label={metric} 
                              size="small" 
                              variant="outlined" 
                              sx={{ mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      </CardContent>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                        <Tooltip title="Edit Configuration">
                          <IconButton size="small" sx={{ mr: 1 }}>
                            <SettingsIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Manual Sync">
                          <IconButton size="small" onClick={() => handleSyncDataSource(dataSource)} sx={{ mr: 1 }}>
                            <SyncIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Disconnect">
                          <IconButton size="small" color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </TabPanel>

          {/* Available Integrations Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Browse and connect to additional data sources
              </Typography>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                {mockDataSources.available.map((dataSource) => (
                  <Grid item xs={12} sm={6} md={3} key={dataSource.id}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        height: '100%',
                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: theme.shadows[4],
                          cursor: 'pointer',
                        },
                      }}
                      onClick={() => {
                        setNewDataSourceType(dataSource.type);
                        setNewDataSourceName(dataSource.name);
                        setOpenDialog(true);
                      }}
                    >
                      <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <Box 
                          sx={{ 
                            p: 2, 
                            borderRadius: '50%', 
                            bgcolor: theme.palette.action.selected,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                          }}
                        >
                          {dataSource.icon}
                        </Box>
                        <Typography variant="h6" align="center">{dataSource.name}</Typography>
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                          {dataSource.description}
                        </Typography>
                      </CardContent>
                      <Divider />
                      <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
                        <Button 
                          startIcon={<AddIcon />} 
                          color="primary" 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setNewDataSourceType(dataSource.type);
                            setNewDataSourceName(dataSource.name);
                            setOpenDialog(true);
                          }}
                        >
                          Connect
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
                <Grid item xs={12} sm={6} md={3}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      height: '100%',
                      border: `1px dashed ${theme.palette.divider}`,
                      backgroundColor: 'transparent',
                      justifyContent: 'center',
                      alignItems: 'center',
                      transition: 'border-color 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        cursor: 'pointer',
                      },
                    }}
                    onClick={handleAddDataSource}
                  >
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <AddIcon color="action" sx={{ fontSize: 40, mb: 2 }} />
                      <Typography variant="h6" align="center">Custom Integration</Typography>
                      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                        Connect to any data source with a custom integration
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Sync History Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Recent sync operations and their status
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Data Source</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Records</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Message</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockSyncHistory.map((sync) => (
                      <TableRow key={sync.id}>
                        <TableCell>{sync.dataSourceName}</TableCell>
                        <TableCell>{formatDate(sync.timestamp)}</TableCell>
                        <TableCell>
                          <Chip 
                            icon={getStatusIcon(sync.status)}
                            label={sync.status.charAt(0).toUpperCase() + sync.status.slice(1)} 
                            size="small"
                            color={getStatusColor(sync.status) as any}
                          />
                        </TableCell>
                        <TableCell>{sync.recordsProcessed.toLocaleString()}</TableCell>
                        <TableCell>{sync.duration}</TableCell>
                        <TableCell>
                          {sync.message || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </TabPanel>

          {/* Settings Tab */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Data Integration Settings
              </Typography>
              <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  General Settings
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel id="sync-frequency-label">Default Sync Frequency</InputLabel>
                      <Select
                        labelId="sync-frequency-label"
                        value="daily"
                        label="Default Sync Frequency"
                      >
                        <MenuItem value="hourly">Hourly</MenuItem>
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel id="data-retention-label">Data Retention Period</InputLabel>
                      <Select
                        labelId="data-retention-label"
                        value="12months"
                        label="Data Retention Period"
                      >
                        <MenuItem value="3months">3 Months</MenuItem>
                        <MenuItem value="6months">6 Months</MenuItem>
                        <MenuItem value="12months">12 Months</MenuItem>
                        <MenuItem value="24months">24 Months</MenuItem>
                        <MenuItem value="indefinite">Indefinite</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Enable automatic synchronization"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Receive notifications on sync failure"
                    />
                    <FormControlLabel
                      control={<Switch />}
                      label="Archive data after retention period"
                    />
                  </Grid>
                </Grid>
              </Paper>

              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Advanced Settings
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="API Rate Limit (requests per minute)"
                      defaultValue="60"
                      fullWidth
                      sx={{ mb: 2 }}
                      type="number"
                    />
                    <TextField
                      label="Connection Timeout (seconds)"
                      defaultValue="30"
                      fullWidth
                      sx={{ mb: 2 }}
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={<Switch />}
                      label="Enable debug logging"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Use SSL for all connections"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Auto-retry failed connections"
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" color="primary">
                    Save Settings
                  </Button>
                </Box>
              </Paper>
            </Box>
          </TabPanel>
        </Paper>
      )}

      {/* Add Data Source Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Connect New Data Source</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Data Source Name"
                fullWidth
                value={newDataSourceName}
                onChange={(e) => setNewDataSourceName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="data-source-type-label">Type</InputLabel>
                <Select
                  labelId="data-source-type-label"
                  value={newDataSourceType}
                  label="Type"
                  onChange={handleDataSourceTypeChange}
                >
                  {dataSourceTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {newDataSourceType && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Connection Settings
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      {newDataSourceType === 'analytics' && 'Connect to your Google Analytics account to import website traffic data.'}
                      {newDataSourceType === 'advertising' && 'Connect to your advertising platform to import campaign performance data.'}
                      {newDataSourceType === 'crm' && 'Connect to your CRM system to import customer and sales data.'}
                      {newDataSourceType === 'email' && 'Connect to your email marketing platform to import campaign metrics.'}
                      {newDataSourceType === 'social' && 'Connect to your social media accounts to import engagement metrics.'}
                      {newDataSourceType === 'custom' && 'Configure a custom API integration to import data from any source.'}
                    </Typography>
                  </Alert>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="API Key"
                    fullWidth
                    value={newDataSourceSettings.apiKey}
                    onChange={(e) => setNewDataSourceSettings({...newDataSourceSettings, apiKey: e.target.value})}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Account ID"
                    fullWidth
                    value={newDataSourceSettings.accountId}
                    onChange={(e) => setNewDataSourceSettings({...newDataSourceSettings, accountId: e.target.value})}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="API URL/Endpoint"
                    fullWidth
                    value={newDataSourceSettings.url}
                    onChange={(e) => setNewDataSourceSettings({...newDataSourceSettings, url: e.target.value})}
                    placeholder="https://api.example.com/v1"
                  />
                </Grid>
                
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      startIcon={<NetworkCheckIcon />}
                      onClick={() => {
                        setIsTestingConnection(true);
                        
                        // Simulate API test connection
                        setTimeout(() => {
                          setIsTestingConnection(false);
                          const isSuccess = Math.random() > 0.3; // 70% chance of success
                          
                          if (isSuccess) {
                            setNotification({
                              open: true,
                              message: 'Connection successful! The credentials are valid.',
                              severity: 'success'
                            });
                          } else {
                            setNotification({
                              open: true,
                              message: 'Connection failed. Please check your credentials and try again.',
                              severity: 'error'
                            });
                          }
                          
                          // Auto-hide notification after 5 seconds
                          setTimeout(() => {
                            setNotification(prev => ({ ...prev, open: false }));
                          }, 5000);
                        }, 1500);
                      }}
                      disabled={isTestingConnection || !newDataSourceSettings.apiKey || !newDataSourceSettings.url}
                    >
                      {isTestingConnection ? 'Testing...' : 'Test Connection'}
                    </Button>
                  </Box>
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAddDataSourceSubmit}
            disabled={!newDataSourceName || !newDataSourceType}
          >
            Connect
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sync Dialog */}
      <Dialog open={syncDialogOpen} onClose={handleCloseSyncDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Sync Data Source: {selectedDataSource?.name}</DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Sync will retrieve the latest data from this source according to the settings below.
            </Typography>
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={syncOptions.fullSync} 
                    onChange={(e) => setSyncOptions({...syncOptions, fullSync: e.target.checked})} 
                  />
                }
                label="Perform full sync (may take longer)"
              />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, ml: 4 }}>
                A full sync will replace all existing data with fresh data from the source.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Historical data period (days)"
                fullWidth
                value={syncOptions.syncPeriod}
                onChange={(e) => setSyncOptions({...syncOptions, syncPeriod: e.target.value})}
                type="number"
                InputProps={{
                  inputProps: { min: 1, max: 365 }
                }}
                helperText="Number of days of historical data to retrieve"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSyncDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSyncSubmit}
            startIcon={<SyncIcon />}
          >
            Start Sync
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataSourcesPage;
