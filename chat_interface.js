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

// Go to alt screen with smcup (`infocmp -1 | grep "[sr]mcup"`)
// \u001b is the same thing as \E (terminal escape)
process.stdout.write("\u001b[?1049h");

splitPanel.topSplit.add(logPanel);
splitPanel.bottomSplit.add(commanderPanel);
ttyPanel.render();

process.stdin.setRawMode(true);
process.stdin.resume();

keypress(process.stdin);
process.stdin.on('keypress', function(chunk, key) {
  if (key && key.ctrl && key.name == 'c') {
    logger.debug('quit program');
    // Return from alt screen with rmcup
    process.stdout.write("\u001b[?1049l");
    process.exit();
  }
});

commanderPanel.on('command', function(command) {
  var textPanel = new logPanels.TextItemPanel({ text: command });
  textPanels.push(textPanel);
  logPanel.add(textPanel);
});
