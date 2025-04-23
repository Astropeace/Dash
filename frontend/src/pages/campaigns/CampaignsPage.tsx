import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Divider,
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
  Tabs,
  Tab,
  useTheme,
  alpha,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useGetCampaignsQuery } from '../../store/api';
import { format } from 'date-fns';

// TabPanel component to handle tab content
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
      id={`campaign-tabpanel-${index}`}
      aria-labelledby={`campaign-tab-${index}`}
      {...other}
      style={{ paddingTop: '20px' }}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

// Status component to display campaign status with appropriate colors
interface StatusProps {
  status: 'active' | 'paused' | 'completed' | 'draft';
}

const Status: React.FC<StatusProps> = ({ status }) => {
  const theme = useTheme();
  let color;
  let iconElement;
  let label;

  switch (status) {
    case 'active':
      color = theme.palette.success.main;
      iconElement = <PlayArrowIcon fontSize="small" />;
      label = 'Active';
      break;
    case 'paused':
      color = theme.palette.warning.main;
      iconElement = <PauseIcon fontSize="small" />;
      label = 'Paused';
      break;
    case 'completed':
      color = theme.palette.info.main;
      iconElement = <CheckCircleIcon fontSize="small" />;
      label = 'Completed';
      break;
    case 'draft':
      color = theme.palette.text.secondary;
      iconElement = <EditIcon fontSize="small" />;
      label = 'Draft';
      break;
    default:
      color = theme.palette.grey[500];
      iconElement = <EditIcon fontSize="small" />;
      label = status;
  }

  return (
    <Chip
      icon={iconElement}
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

// MiniSparkline component to show quick trend visualization in the table
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

// Format percentage consistently
const formatPercent = (value: number) => {
  return `${value.toFixed(2)}%`;
};

// Main component for Campaigns Page
const CampaignsPage: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  // Get campaign data from API
  const { data: campaignsData, isLoading, error } = useGetCampaignsQuery({});

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle menu open
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
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

  // Handle status filter selection
  const handleStatusFilter = (status: string | null) => {
    setSelectedStatus(status);
    setFilterAnchorEl(null);
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

  // Filter campaigns based on search query and selected status
  const campaigns = campaignsData?.data?.campaigns || [];
  const filteredCampaigns = campaigns.filter(
    (campaign: any) =>
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedStatus === null || campaign.status === selectedStatus)
  );

  // Calculate metrics for summary cards
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(
    (c: any) => c.status === 'active'
  ).length;
  const totalBudget = campaigns.reduce(
    (sum: number, c: any) => sum + c.budget,
    0
  );
  const avgROI = totalCampaigns > 0 
    ? campaigns.reduce((sum: number, c: any) => sum + c.roi, 0) / totalCampaigns 
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
        <Typography color="error">Failed to load campaign data.</Typography>
        <Button variant="contained" sx={{ mt: 2 }} startIcon={<RefreshIcon />}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Campaigns</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          size="large"
        >
          Create Campaign
        </Button>
      </Box>

      {/* Summary cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Total Campaigns
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                {totalCampaigns}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Chip
                  label={`${activeCampaigns} Active`}
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
                Total Budget
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                {formatCurrency(totalBudget)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across all campaigns
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Average ROI
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, mb: 1, fontWeight: 'bold', color: theme.palette.success.main }}>
                {avgROI.toFixed(2)}x
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  Performing well
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Campaign Health
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                85%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overall performance score
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main content with tabs */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="campaign tabs">
            <Tab label="All Campaigns" id="campaign-tab-0" />
            <Tab label="Active" id="campaign-tab-1" />
            <Tab label="Scheduled" id="campaign-tab-2" />
            <Tab label="Completed" id="campaign-tab-3" />
            <Tab label="Drafts" id="campaign-tab-4" />
          </Tabs>
        </Box>

        {/* Search and filter bar */}
        <Box sx={{ display: 'flex', p: 2, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider', px: 2 }}>
            <SearchIcon color="action" sx={{ mr: 1 }} />
            <TextField
              variant="standard"
              placeholder="Search campaigns..."
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                disableUnderline: true,
              }}
            />
          </Box>
          <Box sx={{ ml: 2 }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={handleFilterClick}
              endIcon={selectedStatus ? <Chip label={selectedStatus} size="small" onDelete={() => handleStatusFilter(null)} /> : undefined}
            >
              Filter
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
              <MenuItem onClick={() => handleStatusFilter('paused')} selected={selectedStatus === 'paused'}>
                Paused
              </MenuItem>
              <MenuItem onClick={() => handleStatusFilter('completed')} selected={selectedStatus === 'completed'}>
                Completed
              </MenuItem>
              <MenuItem onClick={() => handleStatusFilter('draft')} selected={selectedStatus === 'draft'}>
                Draft
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Campaign table */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table aria-label="campaigns table">
              <TableHead>
                <TableRow>
                  <TableCell>Campaign Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Budget</TableCell>
                  <TableCell>Spent</TableCell>
                  <TableCell>ROI</TableCell>
                  <TableCell>Conversion</TableCell>
                  <TableCell>Trend</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCampaigns
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((campaign: any) => (
                    <TableRow key={campaign.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              mr: 2,
                              bgcolor: campaign.type === 'social' ? 'primary.main' :
                                campaign.type === 'search' ? 'secondary.main' :
                                campaign.type === 'email' ? 'success.main' : 'info.main'
                            }}
                          >
                            {campaign.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {campaign.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Status status={campaign.status} />
                      </TableCell>
                      <TableCell>{formatCurrency(campaign.budget)}</TableCell>
                      <TableCell>{formatCurrency(campaign.spent)}</TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            color: campaign.roi >= 2 ? 'success.main' :
                              campaign.roi >= 1 ? 'warning.main' : 'error.main',
                            fontWeight: 'bold'
                          }}
                        >
                          {campaign.roi.toFixed(2)}x
                        </Typography>
                      </TableCell>
                      <TableCell>{formatPercent(campaign.conversionRate)}</TableCell>
                      <TableCell>
                        <MiniSparkline
                          data={campaign.performanceTrend}
                          color={
                            campaign.performanceTrend[campaign.performanceTrend.length - 1] >
                            campaign.performanceTrend[0]
                              ? theme.palette.success.main
                              : theme.palette.error.main
                          }
                        />
                      </TableCell>
                      <TableCell>{format(new Date(campaign.startDate), 'MMM d, yyyy')}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={handleMenuClick}
                          aria-label="campaign actions"
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredCampaigns.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1" color="text.secondary">
                        No campaigns found matching your criteria
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
            count={filteredCampaigns.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="body1">Active campaigns content</Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="body1">Scheduled campaigns content</Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="body1">Completed campaigns content</Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Typography variant="body1">Draft campaigns content</Typography>
        </TabPanel>
      </Paper>

      {/* Action menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <PlayArrowIcon fontSize="small" sx={{ mr: 1 }} />
          Activate
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <PauseIcon fontSize="small" sx={{ mr: 1 }} />
          Pause
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CampaignsPage;
