after(function() {
  this.timeout(10000);

  console.log('Cleaning up after tests.');
  if (global.server) {
    try {
      global.server.close();
    } catch (e) {
      //just consume an error, we are cleaning up
    }
    global.server = null;
  }
});
