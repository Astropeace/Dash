import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  Avatar,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  SelectChangeEvent,
  Snackbar,
  Alert,
  AlertColor,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Today as TodayIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useGetInvestorsQuery, useCreateInvestorMutation } from '../../store/api';
import { format } from 'date-fns';

// Risk Profile component
interface RiskProfileProps {
  risk: 'low' | 'moderate' | 'high' | 'very_high';
}

const RiskProfile: React.FC<RiskProfileProps> = ({ risk }) => {
  const theme = useTheme();
  let color;
  let label;

  switch (risk) {
    case 'low':
      color = theme.palette.info.main;
      label = 'Low Risk';
      break;
    case 'moderate':
      color = theme.palette.success.main;
      label = 'Moderate';
      break;
    case 'high':
      color = theme.palette.warning.main;
      label = 'High Risk';
      break;
    case 'very_high':
      color = theme.palette.error.main;
      label = 'Very High Risk';
      break;
    default:
      color = theme.palette.grey[500];
      label = risk;
  }

  return (
    <div className="risk-profile-wrapper">
      <Chip
        label={label}
        size="small"
        style={{
          backgroundColor: alpha(color, 0.1),
          color: color,
          borderColor: alpha(color, 0.3),
          fontWeight: 'bold',
        }}
        variant="outlined"
      />
    </div>
  );
};

// Status component
interface StatusProps {
  status: 'active' | 'inactive';
}

const Status: React.FC<StatusProps> = ({ status }) => {
  const theme = useTheme();
  const color = status === 'active' ? theme.palette.success.main : theme.palette.warning.main;
  const label = status === 'active' ? 'Active' : 'Inactive';

  return (
    <Chip
      label={label}
      size="small"
      style={{
        backgroundColor: alpha(color, 0.1),
        color: color,
        borderColor: alpha(color, 0.3),
        fontWeight: 'bold',
      }}
      variant="outlined"
    />
  );
};

// MiniSparkline component to show quick trend visualization
interface MiniSparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

const MiniSparkline: React.FC<MiniSparklineProps> = ({ 
  data, 
  color = '#1976d2',
  height = 30
}) => {
  const theme = useTheme();
  const actualColor = color || theme.palette.primary.main;
  
  // Normalize the data to fit in the height
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1; // Avoid division by zero
  
  const normalizedData = data.map(val => (val - min) / range * height);
  
  // Calculate positions for the polyline
  const width = 80; // Fixed width for the sparkline
  const step = width / (data.length - 1);
  
  const points = normalizedData.map((val, i) => `${i * step},${height - val}`).join(' ');
  
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline
        points={points}
        fill="none"
        stroke={actualColor}
        strokeWidth={1.5}
      />
      {/* Add a dot for the last value */}
      <circle
        cx={(data.length - 1) * step}
        cy={height - normalizedData[normalizedData.length - 1]}
        r={2}
        fill={actualColor}
      />
    </svg>
  );
};

// Format currency consistently
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

// Investor dialog component for displaying detailed information
interface InvestorDialogProps {
  open: boolean;
  onClose: () => void;
  investor: any;
}

const InvestorDialog: React.FC<InvestorDialogProps> = ({ open, onClose, investor }) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  if (!investor) return null;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              width: 56, 
              height: 56, 
              mr: 2, 
              bgcolor: theme.palette.primary.main 
            }}
          >
            {investor.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6">{investor.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {investor.type.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <Divider />
      
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="investor tabs">
            <Tab label="Overview" id="investor-tab-0" />
            <Tab label="Investments" id="investor-tab-1" />
            <Tab label="Contact" id="investor-tab-2" />
          </Tabs>
        </Box>
        
        {/* Overview Tab */}
        <Box role="tabpanel" hidden={tabValue !== 0} sx={{ p: 3 }}>
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Financial Profile
                    </Typography>
                    <List dense disablePadding>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <MoneyIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Total Invested" 
                          secondary={formatCurrency(investor.totalInvested)} 
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'body1', fontWeight: 'bold' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <MoneyIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Available Funds" 
                          secondary={formatCurrency(investor.availableFunds)} 
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'body1', fontWeight: 'bold' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <TrendingUpIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Return on Investment" 
                          secondary={`${investor.roi.toFixed(2)}x`} 
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ 
                            variant: 'body1', 
                            fontWeight: 'bold',
                            color: investor.roi >= 2 ? 'success.main' : 
                              investor.roi >= 1 ? 'warning.main' : 'error.main'
                          }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <AssessmentIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Risk Profile" 
                          secondary={<RiskProfile risk={investor.riskProfile} />} 
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Preferred Sectors
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {investor.preferredSectors.map((sector: string) => (
                        <Chip 
                          key={sector} 
                          label={sector} 
                          size="small" 
                          variant="outlined" 
                          color="primary"
                        />
                      ))}
                    </Box>
                    
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3, mb: 1 }}>
                      Performance Trend
                    </Typography>
                    <Box sx={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MiniSparkline 
                        data={investor.performanceTrend} 
                        color={theme.palette.primary.main} 
                        height={80}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
        
        {/* Investments Tab */}
        <Box role="tabpanel" hidden={tabValue !== 1} sx={{ p: 3 }}>
          {tabValue === 1 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Campaign</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {investor.investmentHistory.map((investment: any, index: number) => (
                    <TableRow key={index} hover>
                      <TableCell>{format(new Date(investment.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{investment.campaign}</TableCell>
                      <TableCell align="right">{formatCurrency(investment.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
        
        {/* Contact Tab */}
        <Box role="tabpanel" hidden={tabValue !== 2} sx={{ p: 3 }}>
          {tabValue === 2 && (
            <List>
              <ListItem>
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary="Contact Name" secondary={investor.contactName} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText primary="Email" secondary={investor.contactEmail} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon />
                </ListItemIcon>
                <ListItemText primary="Phone" secondary={investor.contactPhone} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TodayIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Last Contact" 
                  secondary={format(new Date(investor.lastContactDate), 'MMMM d, yyyy')} 
                />
              </ListItem>
            </List>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" startIcon={<EmailIcon />}>Contact</Button>
      </DialogActions>
    </Dialog>
  );
};

// Investor form interface
interface InvestorFormData {
  name: string;
  type: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  availableFunds: string;
  riskProfile: string;
  preferredSectors: string[];
  status: string;
}

// Notification types
interface NotificationState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

// Add Investor Dialog component
interface AddInvestorDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (investor: InvestorFormData) => void;
}

const AddInvestorDialog: React.FC<AddInvestorDialogProps> = ({ open, onClose, onSave }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState<InvestorFormData>({
    name: '',
    type: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    availableFunds: '',
    riskProfile: 'moderate',
    preferredSectors: [],
    status: 'active'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sectorInput, setSectorInput] = useState('');
  
  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        type: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        availableFunds: '',
        riskProfile: 'moderate',
        preferredSectors: [],
        status: 'active'
      });
      setErrors({});
      setSectorInput('');
    }
  }, [open]);
  
  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Investor name is required';
    }
    
    if (!formData.type) {
      newErrors.type = 'Investor type is required';
    }
    
    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact name is required';
    }
    
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Invalid email address';
    }
    
    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Phone number is required';
    }
    
    if (!formData.availableFunds.trim()) {
      newErrors.availableFunds = 'Available funds is required';
    } else if (isNaN(Number(formData.availableFunds)) || Number(formData.availableFunds) < 0) {
      newErrors.availableFunds = 'Must be a valid number';
    }
    
    if (formData.preferredSectors.length === 0) {
      newErrors.preferredSectors = 'At least one sector is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form input changes for text fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name as string]: value
    });
    
    // Clear error when field is edited
    if (errors[name as string]) {
      setErrors({
        ...errors,
        [name as string]: ''
      });
    }
  };
  
  // Handle select changes
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name as string]: value
    });
    
    // Clear error when field is edited
    if (errors[name as string]) {
      setErrors({
        ...errors,
        [name as string]: ''
      });
    }
  };
  
  // Handle sector chip addition
  const handleAddSector = () => {
    if (sectorInput.trim() && !formData.preferredSectors.includes(sectorInput.trim())) {
      setFormData({
        ...formData,
        preferredSectors: [...formData.preferredSectors, sectorInput.trim()]
      });
      setSectorInput('');
      
      // Clear error if any
      if (errors.preferredSectors) {
        setErrors({
          ...errors,
          preferredSectors: ''
        });
      }
    }
  };
  
  // Handle sector chip deletion
  const handleDeleteSector = (sectorToDelete: string) => {
    setFormData({
      ...formData,
      preferredSectors: formData.preferredSectors.filter(sector => sector !== sectorToDelete)
    });
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Investor</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              name="name"
              label="Investor Name"
              fullWidth
              required
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal" error={!!errors.type} required>
              <InputLabel id="investor-type-label">Investor Type</InputLabel>
              <Select
                labelId="investor-type-label"
                name="type"
                value={formData.type}
                onChange={handleSelectChange}
                label="Investor Type"
              >
                <MenuItem value="venture_capital">Venture Capital</MenuItem>
                <MenuItem value="angel">Angel Investor</MenuItem>
                <MenuItem value="investment_firm">Investment Firm</MenuItem>
                <MenuItem value="corporate">Corporate Investor</MenuItem>
                <MenuItem value="individual">Individual Investor</MenuItem>
              </Select>
              {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }}>
              <Chip label="Contact Information" />
            </Divider>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="contactName"
              label="Contact Name"
              fullWidth
              required
              value={formData.contactName}
              onChange={handleChange}
              error={!!errors.contactName}
              helperText={errors.contactName}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="contactEmail"
              label="Email Address"
              fullWidth
              required
              value={formData.contactEmail}
              onChange={handleChange}
              error={!!errors.contactEmail}
              helperText={errors.contactEmail}
              margin="normal"
              type="email"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="contactPhone"
              label="Phone Number"
              fullWidth
              required
              value={formData.contactPhone}
              onChange={handleChange}
              error={!!errors.contactPhone}
              helperText={errors.contactPhone}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="availableFunds"
              label="Available Funds ($)"
              fullWidth
              required
              value={formData.availableFunds}
              onChange={handleChange}
              error={!!errors.availableFunds}
              helperText={errors.availableFunds}
              margin="normal"
              InputProps={{
                startAdornment: <Typography variant="body1" sx={{ mr: 1 }}>$</Typography>
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }}>
              <Chip label="Investment Preferences" />
            </Divider>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="risk-profile-label">Risk Profile</InputLabel>
              <Select
                labelId="risk-profile-label"
                name="riskProfile"
                value={formData.riskProfile}
                onChange={handleSelectChange}
                label="Risk Profile"
              >
                <MenuItem value="low">Low Risk</MenuItem>
                <MenuItem value="moderate">Moderate</MenuItem>
                <MenuItem value="high">High Risk</MenuItem>
                <MenuItem value="very_high">Very High Risk</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                name="status"
                value={formData.status}
                onChange={handleSelectChange}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Add Preferred Sector"
              value={sectorInput}
              onChange={(e) => setSectorInput(e.target.value)}
              fullWidth
              margin="normal"
              error={!!errors.preferredSectors}
              helperText={errors.preferredSectors}
              InputProps={{
                endAdornment: (
                  <Button 
                    variant="contained" 
                    size="small" 
                    onClick={handleAddSector}
                    disabled={!sectorInput.trim()}
                  >
                    Add
                  </Button>
                )
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSector();
                }
              }}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {formData.preferredSectors.map((sector) => (
                <Chip
                  key={sector}
                  label={sector}
                  onDelete={() => handleDeleteSector(sector)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          startIcon={<AddIcon />}
        >
          Create Investor
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main component for Investors Page
const InvestorsPage: React.FC = () => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [riskFilterAnchorEl, setRiskFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedInvestor, setSelectedInvestor] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Add investor dialog state
  const [addInvestorDialogOpen, setAddInvestorDialogOpen] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Get investors data and mutation hooks from API
  const { data: investorsData, isLoading, error } = useGetInvestorsQuery({});
  const [createInvestor, { isLoading: isCreating }] = useCreateInvestorMutation();
  
  // Handle saving a new investor
  const handleSaveInvestor = async (investor: InvestorFormData) => {
    // Show loading notification
    setNotification({
      open: true,
      message: 'Creating new investor...',
      severity: 'info'
    });
    
    try {
      // Process the form data into the format expected by the API
      const investorData = {
        name: investor.name,
        type: investor.type,
        contactName: investor.contactName,
        contactEmail: investor.contactEmail,
        contactPhone: investor.contactPhone,
        availableFunds: parseFloat(investor.availableFunds),
        riskProfile: investor.riskProfile,
        preferredSectors: investor.preferredSectors,
        status: investor.status
      };
      
      // Call the API mutation to create the investor
      const result = await createInvestor(investorData).unwrap();
      
      // Close the dialog
      setAddInvestorDialogOpen(false);
      
      // Show success notification
      setNotification({
        open: true,
        message: `${investor.name} has been successfully added`,
        severity: 'success'
      });
      
    } catch (error) {
      // Show error notification
      setNotification({
        open: true,
        message: `Error adding investor: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
    }
  };

  // Handle menu open
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, investor: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvestor(investor);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle filter menu open
  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  // Handle filter menu close
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  // Handle risk filter menu open
  const handleRiskFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setRiskFilterAnchorEl(event.currentTarget);
  };

  // Handle risk filter menu close
  const handleRiskFilterClose = () => {
    setRiskFilterAnchorEl(null);
  };

  // Handle status filter selection
  const handleStatusFilter = (status: string | null) => {
    setSelectedStatus(status);
    setFilterAnchorEl(null);
  };

  // Handle risk filter selection
  const handleRiskFilter = (risk: string | null) => {
    setSelectedRisk(risk);
    setRiskFilterAnchorEl(null);
  };

  // Handle page change in pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle investor row click to open details dialog
  const handleInvestorClick = (investor: any) => {
    setSelectedInvestor(investor);
    setDialogOpen(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  // Filter investors based on search query and selected filters
  const investors = investorsData?.data?.investors || [];
  const filteredInvestors = investors.filter(
    (investor: any) =>
      investor.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedStatus === null || investor.status === selectedStatus) &&
      (selectedRisk === null || investor.riskProfile === selectedRisk)
  );

  // Calculate metrics for summary cards
  const totalInvestors = investors.length;
  const activeInvestors = investors.filter(
    (i: any) => i.status === 'active'
  ).length;
  const totalInvested = investors.reduce(
    (sum: number, i: any) => sum + i.totalInvested,
    0
  );
  const totalAvailable = investors.reduce(
    (sum: number, i: any) => sum + i.availableFunds,
    0
  );
  const avgROI = totalInvestors > 0 
    ? investors.reduce((sum: number, i: any) => sum + i.roi, 0) / totalInvestors 
    : 0;

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
        <Typography color="error">Failed to load investor data.</Typography>
        <Button variant="contained" sx={{ mt: 2 }} startIcon={<RefreshIcon />}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with title and action button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Investors</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          size="large"
          onClick={() => setAddInvestorDialogOpen(true)}
        >
          Add Investor
        </Button>
      </Box>

      {/* Summary cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Total Investors
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                {totalInvestors}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Chip
                  label={`${activeInvestors} Active`}
                  size="small"
                  color="success"
                  sx={{ height: 24 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Total Invested
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                {formatCurrency(totalInvested)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across all investors
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Available Funds
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, mb: 1, fontWeight: 'bold', color: theme.palette.success.main }}>
                {formatCurrency(totalAvailable)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MoneyIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  Potential investment
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Average ROI
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, mb: 1, fontWeight: 'bold', color: 
                avgROI >= 2 ? theme.palette.success.main : 
                avgROI >= 1 ? theme.palette.warning.main : 
                theme.palette.error.main 
              }}>
                {avgROI.toFixed(2)}x
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {avgROI >= 1 ? (
                  <>
                    <TrendingUpIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="success.main">
                      Positive returns
                    </Typography>
                  </>
                ) : (
                  <>
                    <TrendingDownIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="error.main">
                      Negative returns
                    </Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main content */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        {/* Search and filter bar */}
        <Box sx={{ display: 'flex', p: 2, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider', px: 2 }}>
            <SearchIcon color="action" sx={{ mr: 1 }} />
            <TextField
              variant="standard"
              placeholder="Search investors..."
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                disableUnderline: true,
              }}
            />
          </Box>
          <Box sx={{ ml: 2, display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={handleFilterClick}
              endIcon={selectedStatus ? <Chip label={selectedStatus} size="small" onDelete={() => handleStatusFilter(null)} /> : undefined}
            >
              Status
            </Button>
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={handleFilterClose}
            >
              <MenuItem onClick={() => handleStatusFilter(null)} selected={selectedStatus === null}>
                All Statuses
              </MenuItem>
              <MenuItem onClick={() => handleStatusFilter('active')} selected={selectedStatus === 'active'}>
                Active
              </MenuItem>
              <MenuItem onClick={() => handleStatusFilter('inactive')} selected={selectedStatus === 'inactive'}>
                Inactive
              </MenuItem>
            </Menu>

            <Button
              variant="outlined"
              startIcon={<AssessmentIcon />}
              onClick={handleRiskFilterClick}
              endIcon={selectedRisk ? <Chip label={selectedRisk.replace('_', ' ')} size="small" onDelete={() => handleRiskFilter(null)} /> : undefined}
            >
              Risk
            </Button>
            <Menu
              anchorEl={riskFilterAnchorEl}
              open={Boolean(riskFilterAnchorEl)}
              onClose={handleRiskFilterClose}
            >
              <MenuItem onClick={() => handleRiskFilter(null)} selected={selectedRisk === null}>
                All Risk Profiles
              </MenuItem>
              <MenuItem onClick={() => handleRiskFilter('low')} selected={selectedRisk === 'low'}>
                Low Risk
              </MenuItem>
              <MenuItem onClick={() => handleRiskFilter('moderate')} selected={selectedRisk === 'moderate'}>
                Moderate
              </MenuItem>
              <MenuItem onClick={() => handleRiskFilter('high')} selected={selectedRisk === 'high'}>
                High Risk
              </MenuItem>
              <MenuItem onClick={() => handleRiskFilter('very_high')} selected={selectedRisk === 'very_high'}>
                Very High Risk
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Investors table */}
        <TableContainer>
          <Table aria-label="investors table">
            <TableHead>
              <TableRow>
                <TableCell>Investor Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Total Invested</TableCell>
                <TableCell>Available Funds</TableCell>
                <TableCell>ROI</TableCell>
                <TableCell>Risk Profile</TableCell>
                <TableCell>Trend</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvestors
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((investor: any) => (
                  <TableRow 
                    key={investor.id} 
                    hover 
                    onClick={() => handleInvestorClick(investor)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            mr: 2,
                            bgcolor: 
                              investor.type === 'venture_capital' ? 'primary.main' :
                              investor.type === 'angel' ? 'secondary.main' :
                              investor.type === 'investment_firm' ? 'success.main' :
                              'info.main'
                          }}
                        >
                          {investor.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {investor.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {investor.contactName}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {investor.type.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </TableCell>
                    <TableCell>
                      <Status status={investor.status} />
                    </TableCell>
                    <TableCell>{formatCurrency(investor.totalInvested)}</TableCell>
                    <TableCell>{formatCurrency(investor.availableFunds)}</TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          color: investor.roi >= 2 ? 'success.main' :
                            investor.roi >= 1 ? 'warning.main' : 'error.main',
                          fontWeight: 'bold'
                        }}
                      >
                        {investor.roi.toFixed(2)}x
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <RiskProfile risk={investor.riskProfile} />
                    </TableCell>
                    <TableCell>
                      <MiniSparkline
                        data={investor.performanceTrend}
                        color={
                          investor.performanceTrend[investor.performanceTrend.length - 1] >
                          investor.performanceTrend[0]
                            ? theme.palette.success.main
                            : theme.palette.error.main
                        }
                      />
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, investor)}
                        aria-label="investor actions"
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredInvestors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      No investors found matching your criteria
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredInvestors.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Action menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <EmailIcon fontSize="small" sx={{ mr: 1 }} />
          Contact
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <BusinessIcon fontSize="small" sx={{ mr: 1 }} />
          View Profile
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Investor detail dialog */}
      <InvestorDialog 
        open={dialogOpen} 
        onClose={handleDialogClose} 
        investor={selectedInvestor} 
      />
      
      {/* Add Investor dialog */}
      <AddInvestorDialog
        open={addInvestorDialogOpen}
        onClose={() => setAddInvestorDialogOpen(false)}
        onSave={handleSaveInvestor}
      />
      
      {/* Notification snackbar */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InvestorsPage;
