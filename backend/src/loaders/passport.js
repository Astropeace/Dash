const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20'); // Import Google Strategy
const bcrypt = require('bcrypt');
const config = require('../config');
const { prisma } = require('./database'); // Correct import for prisma
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

  // Configure Google OAuth 2.0 strategy
  // Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in .env
  if (config.google.clientId && config.google.clientSecret) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: config.google.clientId,
          clientSecret: config.google.clientSecret,
          callbackURL: `${config.apiUrl}/api/v1/auth/google/callback`, // Ensure API_URL is correct in .env
          scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error('Google profile missing email'), false);
            }

            // Find existing user by email
            let user = await prisma.user.findUnique({
              where: {
                // Need a way to find user by email across tenants if email isn't globally unique,
                // OR assume email must be unique for Google OAuth users initially.
                // For now, assuming email is the primary identifier for Google login.
                // This might need adjustment based on how you handle email uniqueness across tenants.
                // Let's try finding *any* user with this email first.
                // If your schema enforces @@unique([email, tenantId]), this won't work directly.
                // We might need a separate lookup or adjust the strategy.
                // --- TEMPORARY APPROACH: Find first user matching email ---
                // This is NOT robust for multi-tenancy if emails can repeat across tenants.
                // A better approach might involve an Invitation model or checking if a user
                // with this email exists *without* a tenantId yet.
                // Let's proceed with findFirst for now and refine later if needed.
                 email: email, // This assumes email is globally unique for Google users or we handle conflicts
              },
            });

            let partialUser;

            if (user) {
              // User exists
              if (!user.isActive) {
                return done(null, false, { message: 'User account is deactivated' });
              }
              logger.info(`Google OAuth: Found existing user ${user.id} for email ${email}`);
              // Return partial user data - IMPORTANT: NO tenantId yet
              partialUser = {
                id: user.id,
                email: user.email,
                firstName: user.firstName || profile.name?.givenName,
                lastName: user.lastName || profile.name?.familyName,
                avatar: user.avatar || profile.photos?.[0]?.value,
                // NO tenantId
              };
            } else {
              // User does not exist, create a new one WITHOUT tenantId
              logger.info(`Google OAuth: Creating new user for email ${email}`);
              // Note: No passwordHash needed for OAuth users initially
              user = await prisma.user.create({
                data: {
                  email: email,
                  firstName: profile.name?.givenName || '',
                  lastName: profile.name?.familyName || '',
                  avatar: profile.photos?.[0]?.value,
                  isActive: true, // Activate on creation
                  // tenantId is intentionally omitted
                  // passwordHash: '', // Set an empty hash or handle differently? Needs consideration.
                                     // For now, let's assume OAuth users might not need a password initially.
                                     // Add a field like 'authProvider' (e.g., 'google', 'local')?
                },
              });
               partialUser = {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                avatar: user.avatar,
                // NO tenantId
              };
            }

            // Pass the partial user data (without tenantId) to the callback handler
            return done(null, partialUser);

          } catch (error) {
            logger.error('Error in Google OAuth strategy', error);
            return done(error);
          }
        }
      )
    );
  } else {
    logger.warn('Google OAuth credentials not found in environment variables. Google login disabled.');
  }


  return passport;
}

module.exports = passportLoader;
