let loopback = require('loopback');
let boot = require('loopback-boot');
let morgan = require('morgan');
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});
let app = module.exports = loopback();

app.use(morgan('dev'));

app.start = function () {
  // start the web server
  return app.listen(function () {
    app.emit('started');
    let baseUrl = app.get('url').replace(/\/$/, '');
    // eslint-disable-next-line no-console
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('@lunchbadger/loopback-component-explorer')) {
      let explorerPath = app.get('@lunchbadger/loopback-component-explorer').mountPath;
      // eslint-disable-next-line no-console
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module) { app.start(); }
});
