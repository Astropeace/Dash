const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { prisma } = require('../../loaders/database');
const config = require('../../config');
const logger = require('../../utils/logger');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, tenantId } = req.body;

    // Check if tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid tenant',
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { 
        email,
        tenantId,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        email,
        passwordHash,
        firstName,
        lastName,
        tenantId,
      },
    });

    // Find default role for the tenant
    const defaultRole = await prisma.role.findFirst({
      where: {
        tenantId,
        name: 'user', // Assuming a default role named 'user'
      },
    });

    // If default role exists, assign it to the user
    if (defaultRole) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: defaultRole.id,
        },
      });
    } else {
      logger.warn(`No default role found for tenant ${tenantId}`);
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'USER_REGISTER',
        resourceType: 'USER',
        resourceId: user.id,
        userId: user.id,
        tenantId,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: { email: user.email },
      },
    });

    // Return success without sensitive data
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    logger.error('Register error:', error);
    next(error);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, async (err, user, info) => {
    try {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: info.message || 'Authentication failed',
        });
      }

      // Generate access token
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, tenantId: user.tenantId },
        config.jwt.secret,
        { expiresIn: config.jwt.accessExpiration }
      );

      // Generate refresh token
      const refreshToken = uuidv4();
      const refreshTokenExpires = new Date();
      refreshTokenExpires.setDate(
        refreshTokenExpires.getDate() + parseInt(config.jwt.refreshExpiration, 10)
      );

      // Save refresh token to database
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          expiresAt: refreshTokenExpires,
          userId: user.id,
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          action: 'USER_LOGIN',
          resourceType: 'USER',
          resourceId: user.id,
          userId: user.id,
          tenantId: user.tenantId,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });

      // Return tokens
      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          accessToken,
          refreshToken,
          expiresIn: config.jwt.accessExpiration,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            roles: user.roles,
          },
        },
      });
    } catch (error) {
      logger.error('Login error:', error);
      next(error);
    }
  })(req, res, next);
});

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh-token', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Refresh token is required',
      });
    }

    // Find the refresh token in the database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    // Check if token exists and is valid
    if (!storedToken || new Date() > storedToken.expiresAt) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired refresh token',
      });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: storedToken.user.id, email: storedToken.user.email, tenantId: storedToken.user.tenantId },
      config.jwt.secret,
      { expiresIn: config.jwt.accessExpiration }
    );

    // Return new access token
    res.status(200).json({
      status: 'success',
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        expiresIn: config.jwt.accessExpiration,
      },
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    next(error);
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Invalidate refresh token
 * @access  Private
 */
router.post('/logout', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Refresh token is required',
      });
    }

    // Delete the refresh token
    await prisma.refreshToken.deleteMany({
      where: {
        token: refreshToken,
        userId: req.user.id,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'USER_LOGOUT',
        resourceType: 'USER',
        resourceId: req.user.id,
        userId: req.user.id,
        tenantId: req.user.tenantId,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  try {
    // Return user information
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    logger.error('Get user error:', error);
    next(error);
  }
});

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password is incorrect',
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash },
    });

    // Invalidate all refresh tokens for the user
    await prisma.refreshToken.deleteMany({
      where: { userId: req.user.id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'PASSWORD_CHANGE',
        resourceType: 'USER',
        resourceId: req.user.id,
        userId: req.user.id,
        tenantId: req.user.tenantId,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully',
    });
  } catch (error) {
    logger.error('Change password error:', error);
    next(error);
  }
});


// --- Google OAuth ---

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth flow
 * @access  Public
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false })); // Use session: false initially, rely on our session logic later

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${config.frontendUrl}/login?error=google_failed`, session: false }), // Authenticate, get partialUser on req.user
  (req, res) => {
    // Authentication successful, req.user contains the partialUser from GoogleStrategy
    const partialUser = req.user;

    if (!partialUser || !partialUser.id) {
      logger.error('Google OAuth callback missing user data after authentication.');
      return res.redirect(`${config.frontendUrl}/login?error=internal_error`);
    }

    // Store partial user data in session to await tenant selection/creation
    req.session.pendingUser = partialUser;
    logger.info(`Stored pending user in session: ${partialUser.email}`);

    // Redirect user to the frontend page for tenant selection
    res.redirect(`${config.frontendUrl}/select-tenant`);
  }
);

// --- Tenant Association (Session Based) ---

/**
 * @route   GET /api/auth/pending-state
 * @desc    Get pending user state from session (after Google OAuth)
 * @access  Private (Session required)
 */
router.get('/pending-state', (req, res) => {
  if (req.session.pendingUser) {
    // TODO: Fetch invitations for req.session.pendingUser.email
    logger.info(`Returning pending user state for: ${req.session.pendingUser.email}`);
    res.status(200).json({
      status: 'success',
      data: {
        user: req.session.pendingUser,
        invitations: [], // Placeholder for tenant invitations
      },
    });
  } else {
    logger.warn('Access to /pending-state without pending user session.');
    res.status(401).json({ status: 'error', message: 'No pending authentication state found.' });
  }
});

/**
 * @route   POST /api/auth/associate-tenant
 * @desc    Associate pending user with an existing tenant
 * @access  Private (Session required)
 */
router.post('/associate-tenant', async (req, res, next) => {
  if (!req.session.pendingUser) {
    return res.status(401).json({ status: 'error', message: 'No pending authentication state found.' });
  }

  const { tenantId } = req.body;
  const partialUser = req.session.pendingUser;

  if (!tenantId) {
    return res.status(400).json({ status: 'error', message: 'Tenant ID is required.' });
  }

  try {
    // TODO: Verify user is allowed to join this tenant (check invitations)
    logger.info(`Attempting to associate user ${partialUser.email} with tenant ${tenantId}`);

    // Update the user record with the tenantId
    const updatedUser = await prisma.user.update({
      where: { id: partialUser.id },
      data: { tenantId: tenantId },
      // Include roles after update if needed
      include: { userRoles: { include: { role: true } } }
    });

     // TODO: Assign default role if none exists?

    // Generate JWT tokens (now with tenantId)
    const accessToken = jwt.sign(
      { id: updatedUser.id, email: updatedUser.email, tenantId: updatedUser.tenantId },
      config.jwt.secret,
      { expiresIn: config.jwt.accessExpiration }
    );
    // TODO: Generate and store refresh token
    const refreshToken = 'dummy-refresh-token-google'; // Placeholder

    // Clear the pending user from the session
    delete req.session.pendingUser;

    // Return tokens and user info
    res.status(200).json({
      status: 'success',
      message: 'Tenant associated successfully.',
      data: {
        accessToken,
        refreshToken,
        expiresIn: config.jwt.accessExpiration,
        user: { // Return user info consistent with local login
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          roles: updatedUser.userRoles?.map(ur => ur.role.name) || [],
        },
      },
    });

  } catch (error) {
    logger.error(`Error associating tenant ${tenantId} for user ${partialUser.email}:`, error);
    next(error);
  }
});

/**
 * @route   POST /api/auth/create-and-associate-tenant
 * @desc    Create a new tenant and associate the pending user
 * @access  Private (Session required)
 */
router.post('/create-and-associate-tenant', async (req, res, next) => {
   if (!req.session.pendingUser) {
    return res.status(401).json({ status: 'error', message: 'No pending authentication state found.' });
  }

  const { tenantName } = req.body; // Add other tenant fields as needed (e.g., tier)
  const partialUser = req.session.pendingUser;

  if (!tenantName) {
    return res.status(400).json({ status: 'error', message: 'Tenant name is required.' });
  }

  try {
    logger.info(`Attempting to create tenant '${tenantName}' for user ${partialUser.email}`);

    // Create the new tenant
    const newTenant = await prisma.tenant.create({
      data: {
        name: tenantName,
        // Add default tier, settings etc. if applicable
      }
    });

    // TODO: Create default roles for the new tenant (e.g., 'admin', 'user')
    const adminRole = await prisma.role.create({
        data: {
            name: 'admin',
            description: 'Administrator role',
            permissions: ["*"], // Example: grant all permissions
            tenantId: newTenant.id,
        }
    });
    // Create other default roles...

    // Update the user record with the new tenantId
    const updatedUser = await prisma.user.update({
      where: { id: partialUser.id },
      data: { tenantId: newTenant.id },
    });

    // Assign the user the 'admin' role for the tenant they created
     await prisma.userRole.create({
        data: {
          userId: updatedUser.id,
          roleId: adminRole.id,
        },
      });

    // Fetch the updated user with roles
     const finalUser = await prisma.user.findUnique({
         where: { id: updatedUser.id },
         include: { userRoles: { include: { role: true } } }
     });


    // Generate JWT tokens
    const accessToken = jwt.sign(
      { id: finalUser.id, email: finalUser.email, tenantId: finalUser.tenantId },
      config.jwt.secret,
      { expiresIn: config.jwt.accessExpiration }
    );
    // TODO: Generate and store refresh token
    const refreshToken = 'dummy-refresh-token-google-new'; // Placeholder

    // Clear the pending user from the session
    delete req.session.pendingUser;

    // Return tokens and user info
    res.status(201).json({ // 201 Created for new tenant
      status: 'success',
      message: 'Tenant created and associated successfully.',
      data: {
        accessToken,
        refreshToken,
        expiresIn: config.jwt.accessExpiration,
        user: {
          id: finalUser.id,
          email: finalUser.email,
          firstName: finalUser.firstName,
          lastName: finalUser.lastName,
          roles: finalUser.userRoles?.map(ur => ur.role.name) || [],
        },
      },
    });

  } catch (error) {
     logger.error(`Error creating tenant '${tenantName}' for user ${partialUser.email}:`, error);
    next(error);
  }
});


module.exports = router;
