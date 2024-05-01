const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/findthatost_api',
    createProxyMiddleware({
      target: !IsEmpty(process.env.REACT_APP_FTO_BACKEND_URL) ? process.env.REACT_APP_FTO_BACKEND_URL : `http://localhost:${5000}`,
      changeOrigin: true,
    })
  );
};