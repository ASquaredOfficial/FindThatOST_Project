const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
	let backendUrl = process.env.REACT_APP_FTO_BACKEND_URL;
	
	// Validate env backend url
	if (!(typeof backendUrl === "string") || (backendUrl.trim().length === 0) || backendUrl === null || backendUrl === undefined) {
		backendUrl = `http://localhost:${5000}`;
	}

	console.log("Application Url:", backendUrl);
	const apiProxy = createProxyMiddleware(
		{
			target: backendUrl,
			changeOrigin: true,
			onError: (err, req, res) => {
				console.error('Proxy Error:', err);
				res.writeHead(500, {
					'Content-Type': 'text/plain'
				});
				res.end('Something went wrong with the proxy. Please try again later.');
			}
		}
	);

	app.use('/findthatost_api', apiProxy);
};