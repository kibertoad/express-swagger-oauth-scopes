const http = require('http');

function launchApp(app, port) {
  port = port || 9999;
  const server = http.createServer(app);

  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      global.app = app;
      global.server = server;
      resolve(app);
    });
  });
}

module.exports = {
  launchApp
};
