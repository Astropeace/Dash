const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { Strategy: LocalStrategy } = require('passport-local');
const bcrypt = require('bcrypt');
const config = require('../config');
const { prisma } = require('./database');
const logger = require('../utils/logger');

/**
 * Initialize Passport authentication strategies
 * @param {Object} app - Express application instance
 */
function passportLoader(app) {
  app.use(passport.initialize());

  // Configure JWT strategy for token-based authentication
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwt.secret,
  };

  passport.use(
    new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
      try {
        // Find user by id in JWT payload
        const user = await prisma.user.findUnique({
          where: { id: jwtPayload.id },
          include: {
            userRoles: {
              include: {
                role: true,
              },
            },
          },
        });

        // Check if user exists and is active
        if (!user) {
          return done(null, false, { message: 'User not found' });
        }

        if (!user.isActive) {
          return done(null, false, { message: 'User account is deactivated' });
        }

        // Extract roles and permissions
        const roles = user.userRoles.map(ur => ur.role.name);
        const permissions = user.userRoles.reduce((acc, ur) => {
          const rolePermissions = ur.role.permissions;
          return [...acc, ...rolePermissions];
        }, []);

        // Create user object without sensitive information
        const userWithoutPassword = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          tenantId: user.tenantId,
          roles,
          permissions,
        };

        return done(null, userWithoutPassword);
      } catch (error) {
        logger.error('Error in JWT strategy', error);
        return done(error);
      }
    })
  );

  // Configure Local strategy for username/password authentication
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          // Find user by email
          const user = await prisma.user.findFirst({
            where: { email },
            include: {
              userRoles: {
                include: {
                  role: true,
                },
              },
            },
          });

          // Check if user exists
          if (!user) {
            return done(null, false, { message: 'Invalid email or password' });
          }

          // Check if user is active
          if (!user.isActive) {
            return done(null, false, { message: 'User account is deactivated' });
          }

          // Compare passwords
          const isMatch = await bcrypt.compare(password, user.passwordHash);
          if (!isMatch) {
            return done(null, false, { message: 'Invalid email or password' });
          }

          // Update last login timestamp
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          });

          // Extract roles and permissions
          const roles = user.userRoles.map(ur => ur.role.name);
          const permissions = user.userRoles.reduce((acc, ur) => {
            const rolePermissions = ur.role.permissions;
            return [...acc, ...rolePermissions];
          }, []);

          // Create user object without sensitive information
          const userWithoutPassword = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            tenantId: user.tenantId,
            roles,
            permissions,
          };

          return done(null, userWithoutPassword);
        } catch (error) {
          logger.error('Error in Local strategy', error);
          return done(error);
        }
      }
    )
  );

  return passport;
}

module.exports = passportLoader;
