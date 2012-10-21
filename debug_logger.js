var Logger = require('bunyan');
var fs = require('fs');
var log = new Logger({
  name: 'node-tty',
  stream: fs.createWriteStream('debug.log', { flags: 'a' }),
  level: 'debug'
});

exports.debug = function() {
  log.debug.apply(log, arguments);
};
