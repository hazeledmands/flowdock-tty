var util = require('util');
var events = require('events');
var readline = require('readline');

var UI = function() {
  events.EventEmitter.call(this);
  this.start();
};
util.inherits(UI, events.EventEmitter);

UI.prototype.showChat = function(user, message) {
  console.log(user + " said " + message);
};

UI.prototype.showError = function(message) {
  console.error(message);
};

UI.prototype.start = function() {
  var self = this;
  var rl = readline.createInterface(process.stdin, process.stdout, null);
  rl.on('line', function(cmd) {
    if(cmd.trim() !== '') {
      self.emit('typedChat', cmd);
    }
    rl.prompt();
  });
  rl.on('close', function() {
    self.emit('close');
  });
  rl.prompt();
};


module.exports = UI;
