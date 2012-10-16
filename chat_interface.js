var clc = require('cli-color');
var panels = require('./panels');

var ttyPanel = new panels.TTYPanel(process.stdout);
ttyPanel.split(3);
ttyPanel.render();
