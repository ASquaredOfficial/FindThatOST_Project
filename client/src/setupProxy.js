const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/findthatost_api',
    createProxyMiddleware({
      target: process.env.REACT_APP_FTO_BACKEND_URL || 5000,
      changeOrigin: true,
    })
  );
};