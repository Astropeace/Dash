import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from './index';

// Mock data for development
const mockData = {
  user: {
    id: 'mock-user-id',
    email: 'demo@example.com',
    firstName: 'Demo',
    lastName: 'User',
    roles: ['admin']
  },
  dashboard: {
    stats: {
      totalRevenue: 1456789.45,
      totalCampaigns: 24,
      conversionRate: 3.2,
      roi: 2.45,
      campaignPerformance: [
        { name: 'Social Media', value: 45 },
        { name: 'Display', value: 28 },
        { name: 'Search', value: 63 },
        { name: 'Email', value: 37 },
      ],
      topInvestors: [
        { name: 'Venture Capital A', amount: 250000 },
        { name: 'Angel Investor B', amount: 150000 },
        { name: 'Investment Firm C', amount: 120000 },
        { name: 'Private Equity D', amount: 100000 },
      ],
    }
  },
  // Mock data for campaigns
  campaigns: {
    campaigns: [
      {
        id: 'c001',
        name: 'Summer Social Media Blitz',
        type: 'social',
        status: 'active',
        budget: 50000,
        spent: 32500,
        roi: 2.8,
        conversionRate: 4.2,
        performanceTrend: [2.1, 2.3, 2.5, 2.7, 2.8],
        startDate: '2025-06-01T00:00:00Z',
        endDate: '2025-08-31T00:00:00Z'
      },
      {
        id: 'c002',
        name: 'Q2 Search Campaign',
        type: 'search',
        status: 'active',
        budget: 75000,
        spent: 45000,
        roi: 3.1,
        conversionRate: 5.6,
        performanceTrend: [2.8, 2.7, 2.9, 3.0, 3.1],
        startDate: '2025-04-01T00:00:00Z',
        endDate: '2025-06-30T00:00:00Z'
      },
      {
        id: 'c003',
        name: 'Spring Email Newsletter',
        type: 'email',
        status: 'completed',
        budget: 15000,
        spent: 15000,
        roi: 4.2,
        conversionRate: 8.1,
        performanceTrend: [3.5, 3.8, 4.0, 4.1, 4.2],
        startDate: '2025-03-01T00:00:00Z',
        endDate: '2025-04-15T00:00:00Z'
      },
      {
        id: 'c004',
        name: 'Winter Holiday Special',
        type: 'display',
        status: 'paused',
        budget: 60000,
        spent: 20000,
        roi: 1.8,
        conversionRate: 2.9,
        performanceTrend: [2.2, 2.0, 1.9, 1.8, 1.8],
        startDate: '2024-11-15T00:00:00Z',
        endDate: '2025-01-15T00:00:00Z'
      },
      {
        id: 'c005',
        name: 'Mobile App Promotion',
        type: 'social',
        status: 'draft',
        budget: 35000,
        spent: 0,
        roi: 0,
        conversionRate: 0,
        performanceTrend: [0, 0, 0, 0, 0],
        startDate: '2025-08-01T00:00:00Z',
        endDate: '2025-09-30T00:00:00Z'
      },
      {
        id: 'c006',
        name: 'Investor Relations Outreach',
        type: 'email',
        status: 'active',
        budget: 25000,
        spent: 10000,
        roi: 1.5,
        conversionRate: 3.2,
        performanceTrend: [1.2, 1.3, 1.4, 1.5, 1.5],
        startDate: '2025-05-01T00:00:00Z',
        endDate: '2025-05-31T00:00:00Z'
      },
      {
        id: 'c007',
        name: 'Product Launch PR',
        type: 'display',
        status: 'active',
        budget: 100000,
        spent: 65000,
        roi: 2.5,
        conversionRate: 4.8,
        performanceTrend: [2.1, 2.2, 2.3, 2.4, 2.5],
        startDate: '2025-02-15T00:00:00Z',
        endDate: '2025-07-15T00:00:00Z'
      },
      {
        id: 'c008',
        name: 'Webinar Series',
        type: 'email',
        status: 'completed',
        budget: 20000,
        spent: 20000,
        roi: 3.2,
        conversionRate: 6.5,
        performanceTrend: [2.7, 2.9, 3.0, 3.1, 3.2],
        startDate: '2025-01-10T00:00:00Z',
        endDate: '2025-03-10T00:00:00Z'
      },
      {
        id: 'c009',
        name: 'Competitive Analysis',
        type: 'search',
        status: 'paused',
        budget: 30000,
        spent: 12000,
        roi: 0.9,
        conversionRate: 1.8,
        performanceTrend: [1.2, 1.1, 1.0, 0.9, 0.9],
        startDate: '2025-04-01T00:00:00Z',
        endDate: '2025-06-30T00:00:00Z'
      },
      {
        id: 'c010',
        name: 'Year-End Review',
        type: 'display',
        status: 'draft',
        budget: 80000,
        spent: 0,
        roi: 0,
        conversionRate: 0,
        performanceTrend: [0, 0, 0, 0, 0],
        startDate: '2025-11-01T00:00:00Z',
        endDate: '2025-12-31T00:00:00Z'
      }
    ]
  },
  // Mock data for investors
  investors: {
    investors: [
      {
        id: 'i001',
        name: 'Venture Capital A',
        type: 'venture_capital',
        status: 'active',
        totalInvested: 1250000,
        availableFunds: 3750000,
        roi: 2.4,
        riskProfile: 'moderate',
        performanceTrend: [2.1, 2.2, 2.3, 2.4, 2.4],
        contactName: 'John Smith',
        contactEmail: 'john@vca.com',
        contactPhone: '+1 (555) 123-4567',
        lastContactDate: '2025-03-15T00:00:00Z',
        investmentHistory: [
          { date: '2024-01-15T00:00:00Z', amount: 500000, campaign: 'Product Launch PR' },
          { date: '2024-06-20T00:00:00Z', amount: 350000, campaign: 'Q2 Search Campaign' },
          { date: '2024-11-10T00:00:00Z', amount: 400000, campaign: 'Winter Holiday Special' }
        ],
        preferredSectors: ['Technology', 'Healthcare', 'Finance']
      },
      {
        id: 'i002',
        name: 'Angel Investor B',
        type: 'angel',
        status: 'active',
        totalInvested: 750000,
        availableFunds: 1250000,
        roi: 3.1,
        riskProfile: 'high',
        performanceTrend: [2.7, 2.8, 2.9, 3.0, 3.1],
        contactName: 'Emily Chen',
        contactEmail: 'emily@angelb.com',
        contactPhone: '+1 (555) 987-6543',
        lastContactDate: '2025-04-02T00:00:00Z',
        investmentHistory: [
          { date: '2024-03-05T00:00:00Z', amount: 250000, campaign: 'Spring Email Newsletter' },
          { date: '2024-08-15T00:00:00Z', amount: 300000, campaign: 'Summer Social Media Blitz' },
          { date: '2025-01-25T00:00:00Z', amount: 200000, campaign: 'Webinar Series' }
        ],
        preferredSectors: ['Retail', 'Consumer Tech', 'Entertainment']
      },
      {
        id: 'i003',
        name: 'Investment Firm C',
        type: 'investment_firm',
        status: 'active',
        totalInvested: 2000000,
        availableFunds: 5000000,
        roi: 1.8,
        riskProfile: 'low',
        performanceTrend: [1.7, 1.7, 1.8, 1.8, 1.8],
        contactName: 'Robert Johnson',
        contactEmail: 'robert@firmc.com',
        contactPhone: '+1 (555) 456-7890',
        lastContactDate: '2025-03-28T00:00:00Z',
        investmentHistory: [
          { date: '2023-12-10T00:00:00Z', amount: 700000, campaign: 'Year-End Review' },
          { date: '2024-05-15T00:00:00Z', amount: 800000, campaign: 'Investor Relations Outreach' },
          { date: '2024-10-20T00:00:00Z', amount: 500000, campaign: 'Q4 Product Launch' }
        ],
        preferredSectors: ['Real Estate', 'Infrastructure', 'Energy']
      },
      {
        id: 'i004',
        name: 'Private Equity D',
        type: 'private_equity',
        status: 'inactive',
        totalInvested: 1500000,
        availableFunds: 8500000,
        roi: 2.2,
        riskProfile: 'moderate',
        performanceTrend: [2.3, 2.3, 2.2, 2.2, 2.2],
        contactName: 'Sarah Williams',
        contactEmail: 'sarah@ped.com',
        contactPhone: '+1 (555) 789-0123',
        lastContactDate: '2025-02-20T00:00:00Z',
        investmentHistory: [
          { date: '2024-02-10T00:00:00Z', amount: 650000, campaign: 'Mobile App Promotion' },
          { date: '2024-07-05T00:00:00Z', amount: 450000, campaign: 'Competitive Analysis' },
          { date: '2024-12-15T00:00:00Z', amount: 400000, campaign: 'Q2 Search Campaign' }
        ],
        preferredSectors: ['Manufacturing', 'Agriculture', 'Transportation']
      },
      {
        id: 'i005',
        name: 'Growth Fund E',
        type: 'growth_fund',
        status: 'active',
        totalInvested: 3000000,
        availableFunds: 7000000,
        roi: 2.8,
        riskProfile: 'high',
        performanceTrend: [2.5, 2.6, 2.7, 2.7, 2.8],
        contactName: 'Michael Brown',
        contactEmail: 'michael@growtfunde.com',
        contactPhone: '+1 (555) 234-5678',
        lastContactDate: '2025-04-05T00:00:00Z',
        investmentHistory: [
          { date: '2024-01-30T00:00:00Z', amount: 1000000, campaign: 'Product Launch PR' },
          { date: '2024-06-15T00:00:00Z', amount: 1200000, campaign: 'Summer Social Media Blitz' },
          { date: '2024-11-25T00:00:00Z', amount: 800000, campaign: 'Year-End Review' }
        ],
        preferredSectors: ['Software', 'E-commerce', 'Fintech']
      },
      {
        id: 'i006',
        name: 'Seed Capital F',
        type: 'seed_capital',
        status: 'active',
        totalInvested: 400000,
        availableFunds: 600000,
        roi: 3.5,
        riskProfile: 'very_high',
        performanceTrend: [3.1, 3.2, 3.3, 3.4, 3.5],
        contactName: 'Jessica Lee',
        contactEmail: 'jessica@seedf.com',
        contactPhone: '+1 (555) 876-5432',
        lastContactDate: '2025-03-18T00:00:00Z',
        investmentHistory: [
          { date: '2024-02-05T00:00:00Z', amount: 150000, campaign: 'Spring Email Newsletter' },
          { date: '2024-07-10T00:00:00Z', amount: 120000, campaign: 'Mobile App Promotion' },
          { date: '2024-12-01T00:00:00Z', amount: 130000, campaign: 'Webinar Series' }
        ],
        preferredSectors: ['Mobile Apps', 'SaaS', 'AI/ML']
      },
      {
        id: 'i007',
        name: 'Corporate Ventures G',
        type: 'corporate_vc',
        status: 'active',
        totalInvested: 5000000,
        availableFunds: 15000000,
        roi: 1.6,
        riskProfile: 'low',
        performanceTrend: [1.5, 1.5, 1.5, 1.6, 1.6],
        contactName: 'David Wilson',
        contactEmail: 'david@corpg.com',
        contactPhone: '+1 (555) 345-6789',
        lastContactDate: '2025-03-25T00:00:00Z',
        investmentHistory: [
          { date: '2023-12-20T00:00:00Z', amount: 1500000, campaign: 'Winter Holiday Special' },
          { date: '2024-05-25T00:00:00Z', amount: 2000000, campaign: 'Q2 Search Campaign' },
          { date: '2024-10-10T00:00:00Z', amount: 1500000, campaign: 'Year-End Review' }
        ],
        preferredSectors: ['Industrial Tech', 'Green Energy', 'Robotics']
      },
      {
        id: 'i008',
        name: 'Family Office H',
        type: 'family_office',
        status: 'active',
        totalInvested: 2500000,
        availableFunds: 5500000,
        roi: 2.0,
        riskProfile: 'moderate',
        performanceTrend: [1.8, 1.9, 1.9, 2.0, 2.0],
        contactName: 'Patricia Garcia',
        contactEmail: 'patricia@familyh.com',
        contactPhone: '+1 (555) 678-9012',
        lastContactDate: '2025-04-03T00:00:00Z',
        investmentHistory: [
          { date: '2024-01-05T00:00:00Z', amount: 800000, campaign: 'Investor Relations Outreach' },
          { date: '2024-06-30T00:00:00Z', amount: 950000, campaign: 'Product Launch PR' },
          { date: '2024-11-15T00:00:00Z', amount: 750000, campaign: 'Competitive Analysis' }
        ],
        preferredSectors: ['Luxury Goods', 'Healthcare', 'Financial Services']
      }
    ]
  }
};

// Define a simplified API for MVP
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Dashboard', 'Campaigns', 'Investors'],
  endpoints: (builder) => ({
    // Authentication endpoints
    login: builder.mutation({
      queryFn: (credentials) => {
        // Mock successful login
        console.log('Mock login with credentials:', credentials);
        return { 
          data: { 
            status: 'success',
            message: 'Login successful',
            data: {
              accessToken: 'mock-token',
              refreshToken: 'mock-refresh-token',
              user: mockData.user
            }
          } 
        };
      }
    }),
    
    refreshToken: builder.mutation({
      queryFn: () => {
        return { 
          data: { 
            status: 'success',
            data: {
              accessToken: 'new-mock-token',
              expiresIn: '1h'
            }
          } 
        };
      }
    }),
    
    logout: builder.mutation({
      queryFn: () => {
        return { data: { status: 'success' } };
      }
    }),
    
    // Dashboard data
    getDashboardStats: builder.query({
      queryFn: () => {
        return { data: { status: 'success', data: mockData.dashboard.stats } };
      }
    }),

    // Campaigns data
    getCampaigns: builder.query({
      queryFn: () => {
        return { data: { status: 'success', data: mockData.campaigns } };
      }
    }),

    // Investors data
    getInvestors: builder.query({
      queryFn: () => {
        return { data: { status: 'success', data: mockData.investors } };
      },
      providesTags: ['Investors']
    }),
    
    // Create a new investor
    createInvestor: builder.mutation({
      queryFn: (investorData) => {
        console.log('Creating investor with data:', investorData);
        
        // In a real app, this would be an API call
        // For the mock, we'll simulate adding to the data
        const newInvestor = {
          id: `i${String(mockData.investors.investors.length + 1).padStart(3, '0')}`,
          ...investorData,
          totalInvested: 0, // New investor starts with no investments
          roi: 0, // New investor starts with no ROI
          performanceTrend: [0, 0, 0, 0, 0, 0], // Initialize with flat trend
          lastContactDate: new Date().toISOString(),
          investmentHistory: []
        };
        
        // Add to mock data
        mockData.investors.investors.push(newInvestor);
        
        return { 
          data: { 
            status: 'success', 
            message: 'Investor created successfully',
            data: newInvestor
          } 
        };
      },
      invalidatesTags: ['Investors']
    }),
  }),
});

// Export hooks for API endpoints
export const {
  useLoginMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetDashboardStatsQuery,
  useGetCampaignsQuery,
  useGetInvestorsQuery,
  useCreateInvestorMutation,
} = api;
