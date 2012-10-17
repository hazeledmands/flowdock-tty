var panels = require('./panels');
var logPanels = require('./log_panels');
var commanderPanels = require('./commander_panels');

var ttyPanel = new panels.TTYPanel(process.stdout);
var splitPanel = ttyPanel.split(5);
var logPanel = new logPanels.LogPanel();
var commanderPanel = new commanderPanels.CommanderPanel({ inputStream: process.stdin });
var text = new logPanels.TextItemPanel({ text: "This is a test" });
var text2 = new logPanels.TextItemPanel({ text: "This is a second test" });

splitPanel.topSplit.add(logPanel);
splitPanel.bottomSplit.add(commanderPanel);
logPanel.add(text);
logPanel.add(text2);
ttyPanel.render();

process.stdin.setRawMode(true);
process.stdin.resume();
