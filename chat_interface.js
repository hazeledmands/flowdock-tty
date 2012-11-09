var keypress = require('keypress');
var fs = require('fs');
var panels = require('./panels');
var logPanels = require('./log_panels');
var commanderPanels = require('./commander_panels');
var logger = require('./debug_logger');

var ttyPanel = new panels.TTYPanel(process.stdout);
var splitPanel = ttyPanel.split(5);
var logPanel = new logPanels.LogPanel({ name: 'output' });
var commanderPanel = new commanderPanels.CommanderPanel({ inputStream: process.stdin, name: 'input' });

var textPanels = [];

splitPanel.topSplit.add(logPanel);
splitPanel.bottomSplit.add(commanderPanel);
ttyPanel.render();

process.stdin.setRawMode(true);
process.stdin.resume();

keypress(process.stdin);
process.stdin.on('keypress', function(chunk, key) {
  // logger.debug({args: arguments}, "key pressed");
  if (key && key.ctrl && key.name == 'c') {
    logger.debug('quit program');
    process.exit();
  }
});

commanderPanel.on('command', function(command) {
  var textPanel = new logPanels.TextItemPanel({ text: command });
  textPanels.push(textPanel);
  logPanel.add(textPanel);
});
