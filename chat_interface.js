var keypress = require('keypress');
var fs = require('fs');
var panels = require('./panels');
var logPanels = require('./log_panels');
var commanderPanels = require('./commander_panels');

var ttyPanel = new panels.TTYPanel(process.stdout);
var splitPanel = ttyPanel.split(5);
var logPanel = new logPanels.LogPanel();
var commanderPanel = new commanderPanels.CommanderPanel({ inputStream: process.stdin });

var log = fs.createWriteStream('debug.log', { flags: 'a' });

splitPanel.topSplit.add(logPanel);
splitPanel.bottomSplit.add(commanderPanel);
ttyPanel.render();

process.stdin.setRawMode(true);
process.stdin.resume();

keypress(process.stdin);
process.stdin.on('keypress', function(chunk, key) {
  var text = 'key: ' + JSON.stringify(key);
  text += ' chunk: ' + chunk;
  text += ' chunk length: ' + chunk.length;
  text += "\n";

  log.write(text);
  logPanel.add(new logPanels.TextItemPanel({ text: text }));
  if (key && key.ctrl && key.name == 'c') {
    process.exit();
  }
});

