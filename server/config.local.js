module.exports = {
  remoting: {
    errorHandler: {
      handler: function(err, req, res, next) {
        // custom error handling logic
        var log = require('debug')('server:rest:errorHandler'); // example
        log(req.method, req.originalUrl, res.statusCode, err);
        next(); // call next() to fall back to the default error handler
      }
    }
  }
};
