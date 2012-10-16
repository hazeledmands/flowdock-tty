var request = require('request');
var _ = require('underscore');
var clc = require('cli-color');
var keypress = require('keypress');

var buffer = "";

var drawBar = function() {
  var spaces = '';
  _.times(clc.width, function() { spaces += ' '; });
  process.stdout.write(clc.moveTo(0, clc.height - 2));
  process.stdout.write(clc.bgWhite(spaces));
}

var prepareForCommands = function() {
  process.stdout.write(clc.moveTo(0, clc.height - 1));
  process.stdout.write('> ');
}

process.stdout.write(clc.reset);

drawBar();
prepareForCommands();

process.stdin.setRawMode(true);
process.stdin.resume();
keypress(process.stdin);

process.stdin.on('keypress', function(chunk, key) {
  if (chunk === "\n") {
    buffer = "";
  } else if (key && key.ctrl && key.name == 'c') {
    process.exit();
  } else {
    buffer += chunk;
    process.stdout.write(chunk);
  }
});