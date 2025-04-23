import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import {
  fetchAlerts,
  createAlert,
  toggleAlertStatus,
  deleteAlert,
  markNotificationAsRead,
  checkMetricsAgainstAlerts,
  selectAlert,
  clearMessage,
  AlertRule,
  NewAlertData
} from '../../store/slices/alertsSlice';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  Tooltip,
  Badge,
  Stack,
  CircularProgress,
  Alert,
  Grid,
  InputAdornment,
  useTheme,
  Drawer,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  AlarmOn as AlarmOnIcon,
  AlarmOff as AlarmOffIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Timeline as TimelineIcon,
  Email as EmailIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  Visibility,
  Visibility as VisibilityIcon,
  Face as FaceIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';

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
      id={`alerts-tabpanel-${index}`}
      aria-labelledby={`alerts-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

// Metric types
const metricTypes = [
  { value: 'cost', label: 'Cost Metrics' },
  { value: 'conversion', label: 'Conversion Metrics' },
  { value: 'engagement', label: 'Engagement Metrics' },
  { value: 'roi', label: 'ROI Metrics' },
  { value: 'traffic', label: 'Traffic Metrics' },
];

// Metrics by type
const metricsByType: Record<string, Array<{value: string, label: string}>> = {
  cost: [
    { value: 'Cost Per Click', label: 'Cost Per Click (CPC)' },
    { value: 'Cost Per Mille', label: 'Cost Per Mille (CPM)' },
    { value: 'Cost Per Acquisition', label: 'Cost Per Acquisition (CPA)' },
    { value: 'Total Ad Spend', label: 'Total Ad Spend' },
  ],
  conversion: [
    { value: 'Conversion Rate', label: 'Conversion Rate' },
    { value: 'Lead Conversion Rate', label: 'Lead Conversion Rate' },
    { value: 'Free Trial Signups', label: 'Free Trial Signups' },
    { value: 'Checkout Abandonment Rate', label: 'Checkout Abandonment Rate' },
  ],
  engagement: [
    { value: 'Click-Through Rate', label: 'Click-Through Rate (CTR)' },
    { value: 'Bounce Rate', label: 'Bounce Rate' },
    { value: 'Average Session Duration', label: 'Average Session Duration' },
    { value: 'Social Media Engagement', label: 'Social Media Engagement' },
  ],
  roi: [
    { value: 'Return on Ad Spend', label: 'Return on Ad Spend (ROAS)' },
    { value: 'Return on Investment', label: 'Return on Investment (ROI)' },
    { value: 'Lifetime Value', label: 'Customer Lifetime Value (LTV)' },
    { value: 'Revenue per Customer', label: 'Revenue per Customer' },
  ],
  traffic: [
    { value: 'Total Visitors', label: 'Total Visitors' },
    { value: 'New Visitors', label: 'New Visitors' },
    { value: 'Returning Visitors', label: 'Returning Visitors' },
    { value: 'Page Views', label: 'Page Views' },
  ],
};

// Alert conditions
const alertConditions = [
  { value: 'greater', label: 'Is Greater Than' },
  { value: 'less', label: 'Is Less Than' },
  { value: 'equal', label: 'Is Equal To' },
];

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

// Get condition text
const getConditionText = (condition: string): string => {
  switch (condition) {
    case 'greater':
      return 'greater than';
    case 'less':
      return 'less than';
    case 'equal':
      return 'equal to';
    default:
      return condition;
  }
};

// Alerts Page Component
const AlertsPage: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<any>();
  const { 
    alertRules, 
    alertNotifications, 
    isLoading, 
    notificationMessage, 
    operationSuccess 
  } = useSelector((state: RootState) => state.alerts);

  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMetricType, setSelectedMetricType] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('');
  const [alertCondition, setAlertCondition] = useState<'greater' | 'less' | 'equal'>('greater');
  const [threshold, setThreshold] = useState('');
  const [alertName, setAlertName] = useState('');
  const [recipients, setRecipients] = useState<string[]>(['']);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Count unread notifications
  const unreadCount = alertNotifications.filter(notification => !notification.read).length;

  // Fetch alerts on component mount
  useEffect(() => {
    dispatch(fetchAlerts());
  }, [dispatch]);

  // Show success message when operation is successful
  useEffect(() => {
    if (operationSuccess && notificationMessage) {
      setShowSuccess(true);
      
      // Hide success message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccess(false);
        dispatch(clearMessage());
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [operationSuccess, notificationMessage, dispatch]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Refresh alerts
  const handleRefresh = () => {
    dispatch(fetchAlerts());
  };
  
  // Open create alert dialog
  const handleCreateAlert = () => {
    resetAlertForm();
    setOpenDialog(true);
  };
  
  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Reset alert form
  const resetAlertForm = () => {
    setAlertName('');
    setSelectedMetricType('');
    setSelectedMetric('');
    setAlertCondition('greater');
    setThreshold('');
    setRecipients(['']);
  };
  
  // Handle metric type change
  const handleMetricTypeChange = (event: any) => {
    setSelectedMetricType(event.target.value);
    setSelectedMetric('');
  };
  
  // Handle alert condition change
  const handleConditionChange = (event: any) => {
    setAlertCondition(event.target.value);
  };
  
  // Add recipient field
  const handleAddRecipient = () => {
    setRecipients([...recipients, '']);
  };
  
  // Update recipient
  const handleRecipientChange = (index: number, value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index] = value;
    setRecipients(newRecipients);
  };
  
  // Remove recipient
  const handleRemoveRecipient = (index: number) => {
    if (recipients.length > 1) {
      const newRecipients = recipients.filter((_, i) => i !== index);
      setRecipients(newRecipients);
    }
  };
  
  // Submit alert form
  const handleSubmitAlert = () => {
    // Filter out empty recipients
    const filteredRecipients = recipients.filter(email => email.trim() !== '');
    
    const alertData: NewAlertData = {
      name: alertName,
      metricType: selectedMetricType,
      metricName: selectedMetric,
      condition: alertCondition,
      threshold: parseFloat(threshold),
      recipients: filteredRecipients
    };
    
    // Dispatch create alert action
    dispatch(createAlert(alertData));
    
    // Close dialog
    setOpenDialog(false);
  };
  
  // Toggle alert status
  const handleToggleAlertStatus = (alertId: string) => {
    dispatch(toggleAlertStatus(alertId));
  };
  
  // Delete alert
  const handleDeleteAlert = (alertId: string) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      dispatch(deleteAlert(alertId));
    }
  };
  
  // Mark notification as read
  const handleMarkAsRead = (notificationId: string) => {
    dispatch(markNotificationAsRead(notificationId));
  };
  
  // Toggle notifications panel
  const handleToggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    
    // Mark all as read when opening
    if (!notificationsOpen && unreadCount > 0) {
      alertNotifications
        .filter(notification => !notification.read)
        .forEach(notification => {
          dispatch(markNotificationAsRead(notification.id));
        });
    }
  };

  // Simulate metric checking (would be automatic in a real app)
  const handleSimulateMetricCheck = () => {
    dispatch(checkMetricsAgainstAlerts({}));
  };

  return (
    <Box>
      {/* Success message */}
      {showSuccess && notificationMessage && (
        <Alert 
          severity="success" 
          sx={{ 
            position: 'fixed', 
            top: 16, 
            right: 16, 
            zIndex: 2000,
            boxShadow: 3,
            maxWidth: 400,
          }}
          onClose={() => {
            setShowSuccess(false);
            dispatch(clearMessage());
          }}
        >
          {notificationMessage}
        </Alert>
      )}
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Alerts & Notifications</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            onClick={handleCreateAlert}
            startIcon={<AddIcon />}
            variant="contained"
            size="small"
          >
            Create Alert
          </Button>
          
          <Button
            onClick={handleRefresh}
            startIcon={<RefreshIcon />}
            variant="outlined"
            size="small"
            disabled={isLoading}
          >
            Refresh
          </Button>
          
          <Tooltip title="View Notifications">
            <IconButton 
              color={notificationsOpen ? 'primary' : 'default'} 
              onClick={handleToggleNotifications}
              sx={{ position: 'relative' }}
            >
              {unreadCount > 0 ? (
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsActiveIcon />
                </Badge>
              ) : (
                <NotificationsIcon />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Main Content */}
      <Paper sx={{ width: '100%', borderRadius: 1 }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="alerts tabs"
          >
            <Tab label="Active Alerts" />
            <Tab label="Alert History" />
            <Tab 
              label="Test Alerts" 
              sx={{ marginLeft: 'auto' }} 
            />
          </Tabs>
        </Box>

        {/* Active Alerts Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Manage your alert rules
            </Typography>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : alertRules.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No alerts configured yet
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateAlert}
                  sx={{ mt: 2 }}
                >
                  Create your first alert
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                {alertRules.map((alert) => (
                  <Grid item xs={12} md={6} key={alert.id}>
                    <Card variant="outlined">
                      <CardHeader
                        avatar={
                          <Box 
                            sx={{ 
                              bgcolor: theme.palette.primary.main,
                              color: theme.palette.primary.contrastText,
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <AlarmOnIcon />
                          </Box>
                        }
                        title={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6" component="span">
                              {alert.name}
                            </Typography>
                            <Chip
                              size="small"
                              color={alert.enabled ? 'success' : 'default'}
                              label={alert.enabled ? 'Active' : 'Disabled'}
                            />
                          </Box>
                        }
                        subheader={
                          <Typography variant="body2" color="text.secondary">
                            Created {formatDate(alert.createdAt)}
                          </Typography>
                        }
                        action={
                          <IconButton onClick={() => handleToggleAlertStatus(alert.id)}>
                            {alert.enabled ? <AlarmOnIcon color="success" /> : <AlarmOffIcon color="disabled" />}
                          </IconButton>
                        }
                      />
                      <Divider />
                      <CardContent>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          Alert when <strong>{alert.metricName}</strong> is{' '}
                          <strong>{getConditionText(alert.condition)}</strong>{' '}
                          <strong>{alert.threshold}</strong>
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Recipients:
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                            {alert.recipients.map((recipient, index) => (
                              <Chip
                                key={index}
                                size="small"
                                label={recipient}
                                icon={<EmailIcon />}
                              />
                            ))}
                          </Stack>
                        </Box>
                        
                        {alert.lastTriggered && (
                          <Typography variant="body2" color="text.secondary">
                            Last triggered: {formatDate(alert.lastTriggered)}
                          </Typography>
                        )}
                      </CardContent>
                      <Divider />
                      <CardActions>
                        <Button 
                          size="small" 
                          startIcon={<EditIcon />}
                          onClick={() => {/* Edit functionality would go here */}}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="small" 
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteAlert(alert.id)}
                        >
                          Delete
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </TabPanel>

        {/* Alert History Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Alert history and triggered notifications
            </Typography>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : alertNotifications.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No alert history yet
                </Typography>
              </Box>
            ) : (
              <Paper variant="outlined" sx={{ mt: 2 }}>
                <List sx={{ width: '100%' }}>
                  {alertNotifications.map((notification, index) => (
                    <React.Fragment key={notification.id}>
                      {index > 0 && <Divider />}
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          bgcolor: notification.read ? 'inherit' : theme.palette.action.hover,
                          py: 2,
                        }}
                      >
                        <ListItemIcon>
                          <Box
                            sx={{
                              bgcolor: notification.read ? theme.palette.grey[200] : theme.palette.primary.main,
                              color: notification.read ? theme.palette.text.secondary : theme.palette.primary.contrastText,
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {notification.condition === 'greater' && notification.actualValue > notification.threshold ? (
                              <ArrowUpwardIcon />
                            ) : notification.condition === 'less' && notification.actualValue < notification.threshold ? (
                              <ArrowDownwardIcon />
                            ) : (
                              <NotificationsIcon />
                            )}
                          </Box>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1">
                              {notification.alertName}
                            </Typography>
                          }
                          secondary={
                            <React.Fragment>
                              <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
                                {notification.metricName} is {notification.actualValue} 
                                ({getConditionText(notification.condition)} threshold of {notification.threshold})
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                Triggered on {formatDate(notification.timestamp)}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                        <ListItemSecondaryAction>
                          {!notification.read && (
                            <Tooltip title="Mark as read">
                              <IconButton 
                                edge="end" 
                                aria-label="mark as read"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            )}
          </Box>
        </TabPanel>

        {/* Test Alerts Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Test your alerts by simulating metric changes
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Simulate Metric Change
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                In a production environment, your alerts would be automatically triggered when metrics change.
                For testing purposes, you can simulate a metric change to see how your alerts work.
              </Typography>
              
              <Button
                variant="contained"
                onClick={handleSimulateMetricCheck}
                startIcon={<TimelineIcon />}
                sx={{ mt: 2 }}
              >
                Simulate Metric Change
              </Button>
            </Paper>
          </Box>
        </TabPanel>
      </Paper>

      {/* Alerts Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Create New Alert</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Alert Name"
                value={alertName}
                onChange={(e) => setAlertName(e.target.value)}
                fullWidth
                placeholder="E.g., High CPC Warning, Low Conversion Alert"
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="metric-type-label">Metric Type</InputLabel>
                <Select
                  labelId="metric-type-label"
                  value={selectedMetricType}
                  onChange={handleMetricTypeChange}
                  label="Metric Type"
                >
                  {metricTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required disabled={!selectedMetricType}>
                <InputLabel id="metric-label">Metric</InputLabel>
                <Select
                  labelId="metric-label"
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  label="Metric"
                >
                  {selectedMetricType && metricsByType[selectedMetricType]?.map((metric) => (
                    <MenuItem key={metric.value} value={metric.value}>
                      {metric.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="condition-label">Condition</InputLabel>
                <Select
                  labelId="condition-label"
                  value={alertCondition}
                  onChange={handleConditionChange}
                  label="Condition"
                >
                  {alertConditions.map((condition) => (
                    <MenuItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Threshold"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                fullWidth
                type="number"
                inputProps={{ step: 0.1 }}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Notification Recipients
              </Typography>
              
              {recipients.map((recipient, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    mb: 2 
                  }}
                >
                  <TextField
                    label={`Recipient ${index + 1}`}
                    value={recipient}
                    onChange={(e) => handleRecipientChange(index, e.target.value)}
                    fullWidth
                    placeholder="Email address"
                    type="email"
                  />
                  <IconButton 
                    color="error" 
                    onClick={() => handleRemoveRecipient(index)}
                    disabled={recipients.length <= 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddRecipient}
                sx={{ mt: 1 }}
              >
                Add Recipient
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitAlert}
            disabled={!alertName || !selectedMetricType || !selectedMetric || !threshold}
            startIcon={<SaveIcon />}
          >
            Create Alert
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications Panel */}
      <Drawer
        anchor="right"
        open={notificationsOpen}
        onClose={handleToggleNotifications}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 } }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          <IconButton onClick={handleToggleNotifications}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List sx={{ width: '100%' }}>
          {alertNotifications.length === 0 ? (
            <ListItem>
              <ListItemText 
                primary="No notifications" 
                secondary="You don't have any notifications yet" 
              />
            </ListItem>
          ) : (
            alertNotifications.map((notification) => (
              <ListItem key={notification.id} alignItems="flex-start">
                <ListItemIcon>
                  {notification.condition === 'greater' && notification.actualValue > notification.threshold ? (
                    <ArrowUpwardIcon color="error" />
                  ) : notification.condition === 'less' && notification.actualValue < notification.threshold ? (
                    <ArrowDownwardIcon color="error" />
                  ) : (
                    <InfoIcon color="info" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={notification.alertName}
                  secondary={
                    <React.Fragment>
                      <Typography variant="body2" color="text.primary">
                        {notification.metricName}: {notification.actualValue}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(notification.timestamp)}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItem>
            ))
          )}
        </List>
      </Drawer>
    </Box>
  );
};

export default AlertsPage;
