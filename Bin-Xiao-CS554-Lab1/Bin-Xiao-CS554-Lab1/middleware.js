
const logger = (req, res, next) => {
  const isAuthenticated = req.session.user ? 'Authenticated' : 'Non-Authenticated';
  console.log(`[${new Date().toUTCString()}] ${req.method} ${req.originalUrl} (${isAuthenticated})`);
  next();
};

const isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'You must be logged in.' });
  }
  next();
};

export default {
  logger,
  isAuthenticated
};
