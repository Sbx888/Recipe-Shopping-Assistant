// Basic authentication middleware
// TODO: Implement proper authentication later
const auth = (req, res, next) => {
  // For now, just pass through
  next();
};

module.exports = auth; 