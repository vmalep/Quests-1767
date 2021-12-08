const moviesRouter = require('./movies');
const usersRouter = require('./users');
const authRouter = require('./auth');

const setupRoutes = (app) => {
  // Movie routes
  app.use('/api/movies', moviesRouter);
  // User routes
  app.use('/api/users', usersRouter);
  // Check credentials
  app.use('/api/auth', authRouter);
};

module.exports = {
  setupRoutes,
};
