const auth = (req, res, next) => {
  console.log('Auth middleware called');
  next();
};

module.exports = auth;