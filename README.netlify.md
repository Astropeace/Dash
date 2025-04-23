# Deploying the Financial Analytics Dashboard to Netlify

This document provides instructions on how to deploy the Financial Analytics Dashboard frontend to Netlify.

## Setup Files for Netlify Deployment

We've already prepared several files specifically for the Netlify deployment:

1. `netlify.toml` - Main configuration file for Netlify deployment
2. `frontend/netlify.toml` - Frontend-specific configuration 
3. `frontend/public/_redirects` - Handles SPA routing on Netlify
4. `frontend/.env.production` - Environment variables for production build
5. Modified API configuration to use mock data

## Deployment Steps

### Option 1: Deploy via Netlify UI

1. Log in to your Netlify account
2. Click "New site from Git"
3. Choose GitHub as your Git provider
4. Select the repository (https://github.com/Astropeace/Dash)
5. Configure build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

### Option 2: Deploy via Netlify CLI

1. Install Netlify CLI if you don't have it already:
   ```bash
   npm install netlify-cli -g
   ```

2. Log in to Netlify from the CLI:
   ```bash
   netlify login
   ```

3. Initialize and deploy the site:
   ```bash
   netlify init
   netlify deploy --prod
   ```

## Features Available in the Deployed Frontend

Since this is a frontend-only deployment, the application will use mock data instead of connecting to a backend:

- Full UI for all dashboard components
- Sample data for all screens
- Complete navigation between pages
- Form submissions using mock data
- Authentication flow (with mock credentials)

### Demo Login Credentials

- Email: `demo@example.com`
- Password: any value will work as it's using mock authentication

## Next Steps for Full Deployment

To make the application fully functional with real data:

1. Deploy the backend API to a service like Heroku, Railway, or Render
2. Set up a PostgreSQL database for data storage
3. Configure Redis for caching and queuing
4. Update the frontend's environment variables to point to the deployed backend
5. Configure CORS on the backend to allow requests from the Netlify domain

## Troubleshooting

If you encounter any issues with the deployment:

1. Check Netlify's deployment logs for specific errors
2. Ensure all build dependencies are correctly specified in package.json
3. Verify that the Netlify configuration is correct
4. Test the site locally using `npm run build` followed by `npm run preview`

## Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#netlify)
- [Single-page Application Routing on Netlify](https://docs.netlify.com/routing/redirects/rewrites-proxies/#history-pushstate-and-single-page-apps)
