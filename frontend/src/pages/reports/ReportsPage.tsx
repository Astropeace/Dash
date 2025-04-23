import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import {
  fetchReports,
  createReport,
  scheduleReport,
  runReport,
  exportReport,
  selectReport,
  clearNotification,
  NewReportData,
  ScheduleReportData,
  ExportReportData,
  Report
} from '../../store/slices/reportsSlice';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Schedule as ScheduleIcon,
  Description as ReportIcon,
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PlayArrow as RunIcon,
  PlayArrow,
  Pause as PauseIcon,
  Share as ShareIcon,
  GetApp as ExportIcon,
  Notifications as NotificationsIcon,
  People as PeopleIcon,
  AccountTree as StructureIcon,
  BarChart as ChartIcon,
  TableChart as TableChartIcon,
  FilterList as FilterIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

// Mock data for reports
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
  ],
  reportTypes: [
    { id: 'performance', name: 'Performance Reports', icon: <ChartIcon /> },
    { id: 'roi', name: 'ROI Analysis', icon: <TableChartIcon /> },
    { id: 'engagement', name: 'Engagement Metrics', icon: <PeopleIcon /> },
    { id: 'financial', name: 'Financial Reports', icon: <ReportIcon /> },
    { id: 'conversion', name: 'Conversion Reports', icon: <FilterIcon /> },
    { id: 'custom', name: 'Custom Reports', icon: <StructureIcon /> }
  ]
};

// Report type chip color mapping
const reportTypeColors: Record<string, string> = {
  performance: 'primary',
  roi: 'secondary',
  engagement: 'info',
  financial: 'success',
  conversion: 'warning',
  custom: 'default'
};

// Frequency options
const frequencyOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'none', label: 'No Schedule' }
];

// Format options
const formatOptions = [
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'Excel' },
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' }
];

// Report status chip color mapping
const statusColors: Record<string, string> = {
  active: 'success',
  paused: 'warning',
  draft: 'info'
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
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

// Reports page component
const ReportsPage: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<any>();
  const { 
    predefinedReports, 
    customReports,
    isLoading, 
    selectedReport: reduxSelectedReport,
    activeOperation,
    operationSuccess,
    notificationMessage
  } = useSelector((state: RootState) => state.reports);

  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'new' | 'schedule' | 'export'>('new');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [exportFormat, setExportFormat] = useState<string>('pdf');
  const [notification, setNotification] = useState<{open: boolean, message: string, type: 'success' | 'error' | 'info'}>({
    open: false,
    message: '',
    type: 'info'
  });
  // Hidden download link ref
  const downloadLinkRef = useRef<HTMLAnchorElement | null>(null);
  
  // New report form state
  const [newReportName, setNewReportName] = useState('');
  const [newReportType, setNewReportType] = useState('');
  const [newReportFormat, setNewReportFormat] = useState<string[]>([]);
  
  // Schedule report form state
  const [scheduleFrequency, setScheduleFrequency] = useState('');
  const [scheduleRecipients, setScheduleRecipients] = useState('');
  const [scheduleActive, setScheduleActive] = useState(true);

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

  // Fetch reports
  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch]);

  // Handle refresh
  const handleRefresh = () => {
    dispatch(fetchReports());
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Open new report dialog
  const handleNewReport = () => {
    setDialogType('new');
    setNewReportName('');
    setNewReportType('');
    setNewReportFormat([]);
    setOpenDialog(true);
  };

  // Open schedule report dialog
  const handleScheduleReport = (report: any) => {
    setSelectedReport(report);
    setDialogType('schedule');
    setScheduleFrequency(report.scheduledFrequency?.toLowerCase() || 'none');
    setScheduleRecipients(report.recipients?.join(', ') || '');
    setScheduleActive(report.status === 'active');
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle report type change
  const handleReportTypeChange = (event: SelectChangeEvent) => {
    setNewReportType(event.target.value);
  };

  // Handle format change
  const handleFormatChange = (format: string) => {
    if (newReportFormat.includes(format)) {
      setNewReportFormat(newReportFormat.filter(f => f !== format));
    } else {
      setNewReportFormat([...newReportFormat, format]);
    }
  };

  // Handle frequency change
  const handleFrequencyChange = (event: SelectChangeEvent) => {
    setScheduleFrequency(event.target.value);
  };

  // Handle report form submission
  const handleCreateReport = () => {
    const newReportData: NewReportData = {
      name: newReportName,
      type: newReportType,
      format: newReportFormat
    };
    
    // Close dialog and dispatch action
    setOpenDialog(false);
    dispatch(createReport(newReportData));
  };

  // Handle schedule form submission
  const handleSaveSchedule = () => {
    if (selectedReport) {
      const scheduleData: ScheduleReportData = {
        id: selectedReport.id,
        frequency: scheduleFrequency,
        recipients: scheduleRecipients.split(',').map(r => r.trim()),
        active: scheduleActive
      };
      
      // Close dialog and dispatch action
      setOpenDialog(false);
      dispatch(scheduleReport(scheduleData));
    }
  };

  // Handle run report
  const handleRunReport = (report: Report) => {
    dispatch(runReport(report.id));
  };

  // Open export report dialog
  const handleExportReport = (report: Report) => {
    dispatch(selectReport(report));
    setSelectedReport(report);
    setDialogType('export');
    setExportFormat('pdf');
    setOpenDialog(true);
  };

  // Process report export
  const handleExportReportSubmit = () => {
    if (selectedReport) {
      const exportData: ExportReportData = {
        id: selectedReport.id,
        format: exportFormat
      };
      
      setOpenDialog(false);
      dispatch(exportReport(exportData));
      
      // Simulate file download process
      setTimeout(() => {
        try {
          // Create a dummy file for download (in a real app, this would be the actual report)
          const fileName = `${selectedReport.name.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}`;
          let fileExtension = '';
          let mimeType = '';
          let content = '';
          
          switch(exportFormat) {
            case 'pdf':
              fileExtension = 'pdf';
              mimeType = 'application/pdf';
              content = 'PDF report content would be here';
              break;
            case 'excel':
              fileExtension = 'xlsx';
              mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
              content = 'Excel data would be here';
              break;
            case 'csv':
              fileExtension = 'csv';
              mimeType = 'text/csv';
              content = 'data,would,be,here\n1,2,3,4';
              break;
            case 'json':
              fileExtension = 'json';
              mimeType = 'application/json';
              content = JSON.stringify({ data: "Report data would be here" }, null, 2);
              break;
          }
          
          // Create a Blob containing the data
          const blob = new Blob([content], { type: mimeType });
          
          // Create a link and trigger download
          if (downloadLinkRef.current) {
            const url = URL.createObjectURL(blob);
            downloadLinkRef.current.href = url;
            downloadLinkRef.current.download = `${fileName}.${fileExtension}`;
            downloadLinkRef.current.click();
            
            // Clean up
            URL.revokeObjectURL(url);
            
            // Show success notification
            setNotification({
              open: true,
              message: `Report successfully exported as ${fileExtension.toUpperCase()}`,
              type: 'success'
            });
            
            // Auto-close notification after 5 seconds
            setTimeout(() => {
              setNotification(prev => ({ ...prev, open: false }));
            }, 5000);
          }
        } catch (error) {
          console.error('Export error:', error);
          // Show error notification
          setNotification({
            open: true,
            message: 'Failed to export report. Please try again.',
            type: 'error'
          });
          
          // Auto-close notification after 5 seconds
          setTimeout(() => {
            setNotification(prev => ({ ...prev, open: false }));
          }, 5000);
        }
      }, 1500);
    }
  };

  return (
    <Box>
      {/* Hidden download link for report export */}
      <a ref={downloadLinkRef} style={{ display: 'none' }} />
      
      {/* Notification snackbar */}
      {notification.open && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 2000,
            maxWidth: 400,
            minWidth: 300,
            backgroundColor: 
              notification.type === 'success' ? theme.palette.success.main : 
              notification.type === 'error' ? theme.palette.error.main : 
              theme.palette.info.main,
            color: '#fff',
            borderRadius: 1,
            boxShadow: 3,
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {notification.type === 'success' && <CheckCircleIcon sx={{ mr: 1.5 }} />}
          {notification.type === 'error' && <ErrorIcon sx={{ mr: 1.5 }} />}
          {notification.type === 'info' && <InfoIcon sx={{ mr: 1.5 }} />}
          <Typography variant="body2">{notification.message}</Typography>
          <IconButton 
            size="small" 
            sx={{ ml: 'auto', color: 'white' }}
            onClick={() => setNotification(prev => ({ ...prev, open: false }))}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Reports</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<AddIcon />}
            onClick={handleNewReport}
            variant="contained"
            size="small"
          >
            New Report
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
              aria-label="reports tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="All Reports" />
              <Tab label="Scheduled Reports" />
              <Tab label="Report Builder" />
              <Tab label="Templates" />
            </Tabs>
          </Box>

          {/* All Reports Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Predefined Reports
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Report Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Last Run</TableCell>
                      <TableCell>Schedule</TableCell>
                      <TableCell>Format</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockReportsData.predefinedReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ReportIcon color="action" fontSize="small" />
                            <Typography>{report.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                            size="small"
                            color={(reportTypeColors[report.type] as any) || 'default'}
                          />
                        </TableCell>
                        <TableCell>{formatDate(report.lastRun)}</TableCell>
                        <TableCell>{report.scheduledFrequency}</TableCell>
                        <TableCell>{report.format}</TableCell>
                        <TableCell>
                          <Chip 
                            label={report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                            size="small"
                            color={(statusColors[report.status] as any) || 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex' }}>
                            <Tooltip title="Run Report">
                              <IconButton size="small" onClick={() => handleRunReport(report)}>
                                <RunIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Schedule">
                              <IconButton size="small" onClick={() => handleScheduleReport(report)}>
                                <ScheduleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Export">
              <IconButton size="small" onClick={() => handleExportReport(report)}>
                <ExportIcon fontSize="small" />
              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Custom Reports
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Report Name</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Last Run</TableCell>
                      <TableCell>Creator</TableCell>
                      <TableCell>Format</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockReportsData.customReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ReportIcon color="action" fontSize="small" />
                            <Typography>{report.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{formatDate(report.created)}</TableCell>
                        <TableCell>{formatDate(report.lastRun)}</TableCell>
                        <TableCell>{report.creator}</TableCell>
                        <TableCell>{report.format}</TableCell>
                        <TableCell>
                          <Chip 
                            label={report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                            size="small"
                            color={(statusColors[report.status] as any) || 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex' }}>
                            <Tooltip title="Run Report">
                              <IconButton size="small" onClick={() => handleRunReport(report)}>
                                <RunIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton size="small">
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </TabPanel>

          {/* Scheduled Reports Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: 2 }}>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Report Name</TableCell>
                      <TableCell>Frequency</TableCell>
                      <TableCell>Next Run</TableCell>
                      <TableCell>Recipients</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockReportsData.predefinedReports
                      .filter(report => report.scheduledFrequency !== 'None')
                      .map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ReportIcon color="action" fontSize="small" />
                              <Typography>{report.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{report.scheduledFrequency}</TableCell>
                          <TableCell>{formatDate(report.nextRun)}</TableCell>
                          <TableCell>
                            {report.recipients?.map((recipient, index) => (
                              <Chip
                                key={index}
                                label={recipient}
                                size="small"
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                            ))}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                              size="small"
                              color={(statusColors[report.status] as any) || 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex' }}>
                              <Tooltip title="Edit Schedule">
                                <IconButton size="small" onClick={() => handleScheduleReport(report)}>
                                  <ScheduleIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={report.status === 'paused' ? 'Resume' : 'Pause'}>
                                <IconButton size="small">
                                  {report.status === 'paused' ? (
                                    <PlayArrow fontSize="small" />
                                  ) : (
                                    <PauseIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </TabPanel>

          {/* Report Builder Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Create Custom Report
              </Typography>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      label="Report Name"
                      fullWidth
                      placeholder="Enter report name"
                      value={newReportName}
                      onChange={(e) => setNewReportName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="report-type-label">Report Type</InputLabel>
                      <Select
                        labelId="report-type-label"
                        id="report-type"
                        value={newReportType}
                        label="Report Type"
                        onChange={handleReportTypeChange}
                      >
                        {mockReportsData.reportTypes.map((type) => (
                          <MenuItem key={type.id} value={type.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {type.icon}
                              <Typography>{type.name}</Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <Typography variant="subtitle2" gutterBottom>
                        Export Format
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {formatOptions.map((format) => (
                          <Chip
                            key={format.value}
                            label={format.label}
                            clickable
                            color={newReportFormat.includes(format.value) ? 'primary' : 'default'}
                            onClick={() => handleFormatChange(format.value)}
                            sx={{ mr: 1 }}
                          />
                        ))}
                      </Box>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Report Components
                    </Typography>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Metrics & KPIs</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <FormControlLabel
                              control={<Switch defaultChecked />}
                              label="Total Revenue"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <FormControlLabel
                              control={<Switch defaultChecked />}
                              label="Conversion Rate"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <FormControlLabel
                              control={<Switch defaultChecked />}
                              label="ROI by Channel"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <FormControlLabel
                              control={<Switch />}
                              label="Cost per Acquisition"
                            />
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Charts & Visualizations</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <FormControlLabel
                              control={<Switch defaultChecked />}
                              label="Performance Trend Chart"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <FormControlLabel
                              control={<Switch />}
                              label="Channel Comparison"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <FormControlLabel
                              control={<Switch defaultChecked />}
                              label="Geographic Distribution"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <FormControlLabel
                              control={<Switch />}
                              label="Device Breakdown"
                            />
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Data Tables</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <FormControlLabel
                              control={<Switch defaultChecked />}
                              label="Campaign Summary Table"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <FormControlLabel
                              control={<Switch />}
                              label="Detailed Metrics Table"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <FormControlLabel
                              control={<Switch />}
                              label="Investor Performance Table"
                            />
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button variant="outlined" sx={{ mr: 1 }}>
                      Save as Draft
                    </Button>
                    <Button 
                      variant="contained" 
                      disabled={!newReportName || !newReportType || newReportFormat.length === 0}
                      onClick={handleCreateReport}
                    >
                      Create Report
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          </TabPanel>

          {/* Templates Tab */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Report Templates
              </Typography>
              <Grid container spacing={3}>
                {mockReportsData.reportTypes.map((type) => (
                  <Grid item xs={12} sm={6} md={4} key={type.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box 
                            sx={{ 
                              p: 1, 
                              borderRadius: 1, 
                              bgcolor: theme.palette.action.selected,
                              mr: 2 
                            }}
                          >
                            {type.icon}
                          </Box>
                          <Typography variant="h6">{type.name}</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {type.id === 'performance' && 'Analysis of campaign performance metrics with key trends and insights.'}
                          {type.id === 'roi' && 'Return on investment analysis across channels and campaigns.'}
                          {type.id === 'engagement' && 'User engagement metrics showing interaction and conversion patterns.'}
                          {type.id === 'financial' && 'Financial performance reports with revenue, costs, and profitability metrics.'}
                          {type.id === 'conversion' && 'Detailed conversion funnel analysis and optimization opportunities.'}
                          {type.id === 'custom' && 'Build a custom report with your selected metrics and visualizations.'}
                        </Typography>
                      </CardContent>
                      <Divider />
                      <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          onClick={() => {
                            setNewReportName('');
                            setNewReportType(type.id);
                            setNewReportFormat([]);
                            setDialogType('new');
                            setOpenDialog(true);
                          }}
                        >
                          Use Template
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </TabPanel>
        </Paper>
      )}

      {/* New Report Dialog */}
      {/* New Report Dialog */}
      <Dialog open={openDialog && dialogType === 'new'} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Report</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Report Name"
                fullWidth
                value={newReportName}
                onChange={(e) => setNewReportName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="dialog-report-type-label">Report Type</InputLabel>
                <Select
                  labelId="dialog-report-type-label"
                  value={newReportType}
                  label="Report Type"
                  onChange={handleReportTypeChange}
                >
                  {mockReportsData.reportTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {type.icon}
                        <Typography>{type.name}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Export Format
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {formatOptions.map((format) => (
                  <Chip
                    key={format.value}
                    label={format.label}
                    clickable
                    color={newReportFormat.includes(format.value) ? 'primary' : 'default'}
                    onClick={() => handleFormatChange(format.value)}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateReport}
            disabled={!newReportName || !newReportType || newReportFormat.length === 0}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Report Dialog */}
      <Dialog open={openDialog && dialogType === 'export'} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Export Report: {selectedReport?.name}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Choose Format
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {formatOptions.map((format) => (
                  <Chip
                    key={format.value}
                    label={format.label}
                    clickable
                    color={exportFormat === format.value ? 'primary' : 'default'}
                    onClick={() => setExportFormat(format.value)}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={handleExportReportSubmit}
          >
            Export
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Schedule Report Dialog */}
      <Dialog open={openDialog && dialogType === 'schedule'} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Report: {selectedReport?.name}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="frequency-label">Frequency</InputLabel>
                <Select
                  labelId="frequency-label"
                  value={scheduleFrequency}
                  label="Frequency"
                  onChange={handleFrequencyChange}
                >
                  {frequencyOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Recipients (comma-separated emails)"
                fullWidth
                value={scheduleRecipients}
                onChange={(e) => setScheduleRecipients(e.target.value)}
                placeholder="example@email.com, another@email.com"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={scheduleActive} 
                    onChange={(e) => setScheduleActive(e.target.checked)} 
                  />
                }
                label="Schedule is active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveSchedule}
            disabled={scheduleFrequency === 'none' && scheduleActive}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportsPage;
