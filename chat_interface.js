var keypress = require('keypress');
var fs = require('fs');
var panels = require('./panels');
var logPanels = require('./log_panels');
var commanderPanels = require('./commander_panels');
var Logger = require('bunyan');

var ttyPanel = new panels.TTYPanel(process.stdout);
var splitPanel = ttyPanel.split(5);
var logPanel = new logPanels.LogPanel();
var commanderPanel = new commanderPanels.CommanderPanel({ inputStream: process.stdin });

var log = new Logger({
  name: 'node-tty',
  stream: fs.createWriteStream('debug.log', { flags: 'a' }),
  level: 'debug'
});

splitPanel.topSplit.add(logPanel);
splitPanel.bottomSplit.add(commanderPanel);
ttyPanel.render();

process.stdin.setRawMode(true);
process.stdin.resume();

keypress(process.stdin);
process.stdin.on('keypress', function(chunk, key) {
  log.info({args: arguments}, "key pressed");
  if (key && key.ctrl && key.name == 'c') {
    process.exit();
  }
});


commanderPanel.on('command', function(command) {
  logPanel.add(new logPanels.TextItemPanel({ text: command }));
});
