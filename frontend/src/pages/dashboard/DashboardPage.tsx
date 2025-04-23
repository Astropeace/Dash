import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Button,
  Divider,
  CircularProgress,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
  Snackbar,
  Alert,
  Stack,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  PieChart as PieChartIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Campaign as CampaignIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Save as SaveIcon,
  DateRange as DateRangeIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { useGetDashboardStatsQuery } from '../../store/api';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

// Metric Card component
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  description,
  color,
}) => {
  const theme = useTheme();

  return (
    <Card 
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          opacity: 0.1,
          transform: 'rotate(15deg)',
          fontSize: '8rem',
        }}
      >
        {icon}
      </Box>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color }}>
          {value}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// Chart Card component
interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, action }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={<Typography variant="h6">{title}</Typography>}
        action={action}
      />
      <Divider />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </CardContent>
    </Card>
  );
};

// Simple Bar Chart component (placeholder)
const SimpleBarChart: React.FC<{ data: any[] }> = ({ data }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ height: '200px', display: 'flex', alignItems: 'flex-end' }}>
      {data.map((item, index) => (
        <Box
          key={index}
          sx={{
            width: `${100 / data.length - 5}%`,
            mx: 1,
            height: `${item.value * 2}px`,
            backgroundColor: theme.palette.primary.main,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            borderRadius: '4px 4px 0 0',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              top: -20,
              color: theme.palette.text.secondary,
            }}
          >
            {item.value}%
          </Typography>
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              bottom: -20,
              color: theme.palette.text.secondary,
            }}
          >
            {item.name}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Dialog states
  const [createCampaignOpen, setCreateCampaignOpen] = useState(false);
  const [addInvestorOpen, setAddInvestorOpen] = useState(false);
  const [generateReportOpen, setGenerateReportOpen] = useState(false);
  const [importDataOpen, setImportDataOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');

  // Form states
  // Campaign form
  const [campaignName, setCampaignName] = useState('');
  const [campaignType, setCampaignType] = useState('');
  const [campaignBudget, setCampaignBudget] = useState('');
  const [campaignStartDate, setCampaignStartDate] = useState<Date | null>(new Date());
  const [campaignEndDate, setCampaignEndDate] = useState<Date | null>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // +30 days
  
  // Investor form
  const [investorName, setInvestorName] = useState('');
  const [investorEmail, setInvestorEmail] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [investorType, setInvestorType] = useState('individual');
  
  // Report form
  const [reportType, setReportType] = useState('financial');
  const [reportStartDate, setReportStartDate] = useState<Date | null>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)); // -30 days
  const [reportEndDate, setReportEndDate] = useState<Date | null>(new Date());
  const [reportFormat, setReportFormat] = useState('pdf');
  
  // Import form
  const [dataSource, setDataSource] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  // Show success message
  const showSuccessMessage = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  // Show error message
  const showErrorMessage = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarSeverity('error');
    setSnackbarOpen(true);
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Reset all form states
  const resetAllForms = () => {
    // Reset campaign form
    setCampaignName('');
    setCampaignType('');
    setCampaignBudget('');
    setCampaignStartDate(new Date());
    setCampaignEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    
    // Reset investor form
    setInvestorName('');
    setInvestorEmail('');
    setInvestmentAmount('');
    setInvestorType('individual');
    
    // Reset report form
    setReportType('financial');
    setReportStartDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    setReportEndDate(new Date());
    setReportFormat('pdf');
    
    // Reset import form
    setDataSource('');
    setImportFile(null);
    setImportLoading(false);
  };

  // Use the RTK Query hook with our mock API
  const { data, isLoading, error } = useGetDashboardStatsQuery({});
  
  // Safely access dashboard data
  const dashboardData = data?.data || {
    totalRevenue: 0,
    totalCampaigns: 0,
    conversionRate: 0,
    roi: 0,
    campaignPerformance: [],
    topInvestors: [],
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Failed to load dashboard data.</Typography>
        <Button variant="contained" sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Financial Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom color="text.secondary">
        Overview of your financial analytics and performance metrics
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(dashboardData.totalRevenue)}
            icon={<MoneyIcon />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Campaigns"
            value={dashboardData.totalCampaigns}
            icon={<BarChartIcon />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Conversion Rate"
            value={`${dashboardData.conversionRate}%`}
            icon={<PieChartIcon />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Return on Investment"
            value={`${dashboardData.roi}x`}
            icon={<TrendingUpIcon />}
            color={theme.palette.secondary.main}
          />
        </Grid>
      </Grid>

      {/* Charts & Reports */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <ChartCard
            title="Campaign Performance"
            action={
              <Button size="small" color="primary">
                View All
              </Button>
            }
          >
            <SimpleBarChart data={dashboardData.campaignPerformance} />
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <ChartCard title="Top Investors">
            <Box sx={{ mt: 2 }}>
              {dashboardData.topInvestors.map((investor, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="body2">{investor.name}</Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}
                  >
                    {formatCurrency(investor.amount)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </ChartCard>
        </Grid>
      </Grid>

      {/* Recent Activity and Quick Actions */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<CampaignIcon />}
                onClick={() => setCreateCampaignOpen(true)}
              >
                Create Campaign
              </Button>
              <Button 
                variant="contained" 
                color="secondary"
                startIcon={<PersonIcon />}
                onClick={() => setAddInvestorOpen(true)}
              >
                Add Investor
              </Button>
              <Button 
                variant="outlined"
                startIcon={<DescriptionIcon />}
                onClick={() => setGenerateReportOpen(true)}
              >
                Generate Report
              </Button>
              <Button 
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => setImportDataOpen(true)}
              >
                Import Data
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Create Campaign Dialog */}
      <Dialog 
        open={createCampaignOpen} 
        onClose={() => setCreateCampaignOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CampaignIcon sx={{ mr: 1 }} />
              Create New Campaign
            </Box>
            <IconButton
              aria-label="close"
              onClick={() => setCreateCampaignOpen(false)}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Campaign Name"
              fullWidth
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              required
              placeholder="Enter campaign name"
            />

            <FormControl fullWidth required>
              <InputLabel id="campaign-type-label">Campaign Type</InputLabel>
              <Select
                labelId="campaign-type-label"
                value={campaignType}
                label="Campaign Type"
                onChange={(e) => setCampaignType(e.target.value)}
              >
                <MenuItem value="social">Social Media</MenuItem>
                <MenuItem value="email">Email Marketing</MenuItem>
                <MenuItem value="display">Display Advertising</MenuItem>
                <MenuItem value="search">Search Engine Marketing</MenuItem>
                <MenuItem value="video">Video Marketing</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Budget"
              fullWidth
              value={campaignBudget}
              onChange={(e) => setCampaignBudget(e.target.value)}
              required
              type="number"
              placeholder="Enter budget amount"
              InputProps={{
                startAdornment: <InputLabel sx={{ mr: 1 }}>$</InputLabel>,
              }}
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <DatePicker
                  label="Start Date"
                  value={campaignStartDate}
                  onChange={(newValue) => setCampaignStartDate(newValue)}
                  sx={{ flex: 1 }}
                />
                <DatePicker
                  label="End Date"
                  value={campaignEndDate}
                  onChange={(newValue) => setCampaignEndDate(newValue)}
                  sx={{ flex: 1 }}
                />
              </Box>
            </LocalizationProvider>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setCreateCampaignOpen(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => {
              // Validation
              if (!campaignName || !campaignType || !campaignBudget || !campaignStartDate || !campaignEndDate) {
                showErrorMessage('Please fill in all required fields');
                return;
              }

              // Save campaign (would dispatch to Redux in a real app)
              showSuccessMessage('Campaign created successfully');
              setCreateCampaignOpen(false);
              
              // Go to campaigns page after a short delay
              setTimeout(() => {
                navigate('/campaigns');
              }, 1500);
            }}
          >
            Create Campaign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Investor Dialog */}
      <Dialog 
        open={addInvestorOpen} 
        onClose={() => setAddInvestorOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ mr: 1 }} />
              Add New Investor
            </Box>
            <IconButton
              aria-label="close"
              onClick={() => setAddInvestorOpen(false)}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Investor Name"
              fullWidth
              value={investorName}
              onChange={(e) => setInvestorName(e.target.value)}
              required
              placeholder="Enter investor name"
            />

            <TextField
              label="Email Address"
              fullWidth
              value={investorEmail}
              onChange={(e) => setInvestorEmail(e.target.value)}
              required
              type="email"
              placeholder="Enter email address"
            />

            <FormControl fullWidth required>
              <InputLabel id="investor-type-label">Investor Type</InputLabel>
              <Select
                labelId="investor-type-label"
                value={investorType}
                label="Investor Type"
                onChange={(e) => setInvestorType(e.target.value)}
              >
                <MenuItem value="individual">Individual</MenuItem>
                <MenuItem value="corporation">Corporation</MenuItem>
                <MenuItem value="venture">Venture Capital</MenuItem>
                <MenuItem value="angel">Angel Investor</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Investment Amount"
              fullWidth
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(e.target.value)}
              required
              type="number"
              placeholder="Enter investment amount"
              InputProps={{
                startAdornment: <InputLabel sx={{ mr: 1 }}>$</InputLabel>,
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setAddInvestorOpen(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => {
              // Validation
              if (!investorName || !investorEmail || !investmentAmount) {
                showErrorMessage('Please fill in all required fields');
                return;
              }

              // Check email format
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(investorEmail)) {
                showErrorMessage('Please enter a valid email address');
                return;
              }

              // Save investor (would dispatch to Redux in a real app)
              showSuccessMessage('Investor added successfully');
              setAddInvestorOpen(false);
              
              // Go to investors page after a short delay
              setTimeout(() => {
                navigate('/investors');
              }, 1500);
            }}
          >
            Add Investor
          </Button>
        </DialogActions>
      </Dialog>

      {/* Generate Report Dialog */}
      <Dialog 
        open={generateReportOpen} 
        onClose={() => setGenerateReportOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DescriptionIcon sx={{ mr: 1 }} />
              Generate Report
            </Box>
            <IconButton
              aria-label="close"
              onClick={() => setGenerateReportOpen(false)}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel id="report-type-label">Report Type</InputLabel>
              <Select
                labelId="report-type-label"
                value={reportType}
                label="Report Type"
                onChange={(e) => setReportType(e.target.value)}
              >
                <MenuItem value="financial">Financial Summary</MenuItem>
                <MenuItem value="campaign">Campaign Performance</MenuItem>
                <MenuItem value="investor">Investor Overview</MenuItem>
                <MenuItem value="metrics">Key Metrics Report</MenuItem>
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <DatePicker
                  label="Start Date"
                  value={reportStartDate}
                  onChange={(newValue) => setReportStartDate(newValue)}
                  sx={{ flex: 1 }}
                />
                <DatePicker
                  label="End Date"
                  value={reportEndDate}
                  onChange={(newValue) => setReportEndDate(newValue)}
                  sx={{ flex: 1 }}
                />
              </Box>
            </LocalizationProvider>

            <FormControl fullWidth required>
              <InputLabel id="report-format-label">Report Format</InputLabel>
              <Select
                labelId="report-format-label"
                value={reportFormat}
                label="Report Format"
                onChange={(e) => setReportFormat(e.target.value)}
              >
                <MenuItem value="pdf">PDF Document</MenuItem>
                <MenuItem value="excel">Excel Spreadsheet</MenuItem>
                <MenuItem value="csv">CSV File</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setGenerateReportOpen(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={() => {
              // Generate report (would actually create the report in a real app)
              showSuccessMessage(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully`);
              setGenerateReportOpen(false);
              
              // Go to reports page after a short delay
              setTimeout(() => {
                navigate('/reports');
              }, 1500);
            }}
          >
            Generate Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Data Dialog */}
      <Dialog 
        open={importDataOpen} 
        onClose={() => setImportDataOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CloudUploadIcon sx={{ mr: 1 }} />
              Import Data
            </Box>
            <IconButton
              aria-label="close"
              onClick={() => setImportDataOpen(false)}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel id="data-source-label">Data Source</InputLabel>
              <Select
                labelId="data-source-label"
                value={dataSource}
                label="Data Source"
                onChange={(e) => setDataSource(e.target.value)}
              >
                <MenuItem value="file">Upload File</MenuItem>
                <MenuItem value="google">Google Analytics</MenuItem>
                <MenuItem value="facebook">Facebook Ads</MenuItem>
                <MenuItem value="hubspot">HubSpot</MenuItem>
                <MenuItem value="salesforce">Salesforce</MenuItem>
              </Select>
              <FormHelperText>Select where you want to import data from</FormHelperText>
            </FormControl>

            {dataSource === 'file' && (
              <Box 
                sx={{ 
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                  }
                }}
                onClick={() => {
                  // This would open a file picker in a real implementation
                  const fakeName = 'imported-data.csv';
                  setImportFile(new File([], fakeName));
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  {importFile ? importFile.name : 'Click to upload file'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supports CSV, Excel, and JSON formats
                </Typography>
              </Box>
            )}

            {dataSource && dataSource !== 'file' && (
              <Alert severity="info">
                You will be redirected to connect to {dataSource.charAt(0).toUpperCase() + dataSource.slice(1)} after clicking "Import Data"
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setImportDataOpen(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            startIcon={<CloudUploadIcon />}
            disabled={!dataSource || (dataSource === 'file' && !importFile) || importLoading}
            onClick={() => {
              // Simulating import process
              setImportLoading(true);
              
              // Fake a loading delay
              setTimeout(() => {
                setImportLoading(false);
                showSuccessMessage('Data imported successfully');
                setImportDataOpen(false);
                
                // Go to data sources page after a short delay
                setTimeout(() => {
                  navigate('/data-sources');
                }, 1500);
              }, 2000);
            }}
          >
            {importLoading ? <CircularProgress size={24} /> : 'Import Data'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardPage;
