const express = require('express');
const passport = require('passport');
const { prisma } = require('../../loaders/database');
const logger = require('../../utils/logger');

const router = express.Router();

// Authentication middleware
const authenticate = passport.authenticate('jwt', { session: false });

// Permission-based authorization middleware
const authorize = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user.permissions.includes(requiredPermission)) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: Insufficient permissions',
      });
    }
    next();
  };
};

/**
 * @route   GET /api/users
 * @desc    Get all users (with pagination and filtering)
 * @access  Private (admin/manager)
 */
router.get(
  '/',
  authenticate,
  authorize('users:read'),
  async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        role,
        isActive,
      } = req.query;

      // Parse pagination params
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build filter conditions
      const where = {
        tenantId: req.user.tenantId, // Multi-tenant filter
      };

      // Add search condition if provided
      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Add role filter if provided
      if (role) {
        where.userRoles = {
          some: {
            role: {
              name: role,
            },
          },
        };
      }

      // Add active status filter if provided
      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      // Count total matching users
      const total = await prisma.user.count({ where });

      // Fetch users with pagination, sorting and relations
      const users = await prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: {
          [sortBy]: sortOrder.toLowerCase(),
        },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          passwordHash: false, // Explicitly exclude password
        },
      });

      // Map users to include role names instead of full role objects
      const mappedUsers = users.map(user => ({
        ...user,
        roles: user.userRoles.map(ur => ur.role.name),
        userRoles: undefined, // Remove the original userRoles
      }));

      res.status(200).json({
        status: 'success',
        data: {
          users: mappedUsers,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum),
          },
        },
      });
    } catch (error) {
      logger.error('Get users error:', error);
      next(error);
    }
  }
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (admin/manager or self)
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check authorization - users can view themselves or those with permission
    if (id !== req.user.id && !req.user.permissions.includes('users:read')) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: Insufficient permissions',
      });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        isActive: true,
        mfaEnabled: true,
        lastLogin: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
        passwordHash: false, // Explicitly exclude password
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Check tenant access - only same tenant
    if (user.tenantId !== req.user.tenantId) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: Cannot access users in different tenants',
      });
    }

    // Map user to include role names
    const mappedUser = {
      ...user,
      roles: user.userRoles.map(ur => ur.role.name),
      userRoles: undefined, // Remove the original userRoles
    };

    res.status(200).json({
      status: 'success',
      data: {
        user: mappedUser,
      },
    });
  } catch (error) {
    logger.error('Get user error:', error);
    next(error);
  }
});

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Private (admin)
 */
router.post(
  '/',
  authenticate,
  authorize('users:create'),
  async (req, res, next) => {
    try {
      const { email, password, firstName, lastName, roleIds, isActive = true } = req.body;

      // Check if user already exists in this tenant
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          tenantId: req.user.tenantId,
        },
      });

      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'User with this email already exists',
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          isActive,
          tenantId: req.user.tenantId,
        },
      });

      // Assign roles if provided
      if (roleIds && roleIds.length > 0) {
        // Verify all roles belong to the same tenant
        const roles = await prisma.role.findMany({
          where: {
            id: { in: roleIds },
            tenantId: req.user.tenantId,
          },
        });

        if (roles.length !== roleIds.length) {
          return res.status(400).json({
            status: 'error',
            message: 'Some role IDs are invalid or belong to a different tenant',
          });
        }

        // Create role assignments
        const userRoles = roleIds.map(roleId => ({
          userId: user.id,
          roleId,
        }));

        await prisma.userRole.createMany({
          data: userRoles,
        });
      }

      // Create audit log
      await prisma.auditLog.create({
        data: {
          action: 'USER_CREATE',
          resourceType: 'USER',
          resourceId: user.id,
          userId: req.user.id,
          tenantId: req.user.tenantId,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          details: { email: user.email },
        },
      });

      res.status(201).json({
        status: 'success',
        message: 'User created successfully',
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
        },
      });
    } catch (error) {
      logger.error('Create user error:', error);
      next(error);
    }
  }
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (admin or self)
 */
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, roleIds, isActive } = req.body;

    // Get user to update
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Check authorization - users can update themselves or admin can update any user in same tenant
    const isSelf = id === req.user.id;
    const isAdmin = req.user.permissions.includes('users:update');

    if (!isSelf && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: Insufficient permissions',
      });
    }

    // Check tenant access - only same tenant
    if (user.tenantId !== req.user.tenantId) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: Cannot update users in different tenants',
      });
    }

    // Prepare update data
    const updateData = {};

    // Only update fields that are provided
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    
    // Only admins can update isActive status
    if (isActive !== undefined && isAdmin) {
      updateData.isActive = isActive;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Update roles if provided and user is admin
    if (roleIds && roleIds.length > 0 && isAdmin) {
      // Verify all roles belong to the same tenant
      const roles = await prisma.role.findMany({
        where: {
          id: { in: roleIds },
          tenantId: req.user.tenantId,
        },
      });

      if (roles.length !== roleIds.length) {
        return res.status(400).json({
          status: 'error',
          message: 'Some role IDs are invalid or belong to a different tenant',
        });
      }

      // Delete existing roles
      await prisma.userRole.deleteMany({
        where: { userId: id },
      });

      // Create new role assignments
      const userRoles = roleIds.map(roleId => ({
        userId: id,
        roleId,
      }));

      await prisma.userRole.createMany({
        data: userRoles,
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'USER_UPDATE',
        resourceType: 'USER',
        resourceId: id,
        userId: req.user.id,
        tenantId: req.user.tenantId,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: { updatedFields: Object.keys(updateData) },
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        isActive: updatedUser.isActive,
      },
    });
  } catch (error) {
    logger.error('Update user error:', error);
    next(error);
  }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('users:delete'),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      // Get user to delete
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      // Check tenant access - only same tenant
      if (user.tenantId !== req.user.tenantId) {
        return res.status(403).json({
          status: 'error',
          message: 'Forbidden: Cannot delete users in different tenants',
        });
      }

      // Check if trying to delete self
      if (id === req.user.id) {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot delete your own account',
        });
      }

      // Create audit log before deleting user
      await prisma.auditLog.create({
        data: {
          action: 'USER_DELETE',
          resourceType: 'USER',
          resourceId: id,
          userId: req.user.id,
          tenantId: req.user.tenantId,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          details: { email: user.email },
        },
      });

      // Delete user
      await prisma.user.delete({
        where: { id },
      });

      res.status(200).json({
        status: 'success',
        message: 'User deleted successfully',
      });
    } catch (error) {
      logger.error('Delete user error:', error);
      next(error);
    }
  }
);

/**
 * @route   GET /api/users/:id/audit-logs
 * @desc    Get audit logs for a user
 * @access  Private (admin or self)
 */
router.get('/:id/audit-logs', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Parse pagination params
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Check authorization - users can view their own logs or admin can view any logs
    const isSelf = id === req.user.id;
    const isAdmin = req.user.permissions.includes('audit-logs:read');

    if (!isSelf && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: Insufficient permissions',
      });
    }

    // Get user to verify tenant
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Check tenant access - only same tenant
    if (user.tenantId !== req.user.tenantId) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: Cannot access users in different tenants',
      });
    }

    // Count total logs
    const total = await prisma.auditLog.count({
      where: {
        userId: id,
        tenantId: req.user.tenantId,
      },
    });

    // Get audit logs
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        userId: id,
        tenantId: req.user.tenantId,
      },
      orderBy: {
        timestamp: 'desc',
      },
      skip,
      take: limitNum,
    });

    res.status(200).json({
      status: 'success',
      data: {
        auditLogs,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error('Get user audit logs error:', error);
    next(error);
  }
});

module.exports = router;
