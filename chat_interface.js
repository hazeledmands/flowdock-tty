var panels = require('./panels');
var CommanderPanel = require('./commander_panel.js');

var ttyPanel = new panels.TTYPanel(process.stdout);
var splitPanel = ttyPanel.split(5);
var commanderPanel = new CommanderPanel({ inputStream: process.stdin });
splitPanel.bottomSplit.add(commanderPanel);
ttyPanel.render();

process.stdin.setRawMode(true);
process.stdin.resume();
