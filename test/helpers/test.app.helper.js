const http = require('http');

function launchApp(app) {
	const server = http.createServer(app);

	return new Promise(((resolve, reject) => {
		server.listen(9999, () => {
			global.app = app;
			global.server = server;
			resolve(app);
		});
	}));
}

module.exports = {
	launchApp
};
