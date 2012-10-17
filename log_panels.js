var _ = require('underscore');
var panels = require('./panels');

var LogPanel = function(options) {
  panels.Panel.call(this, options);
};
_.extend(LogPanel.prototype, panels.Panel.prototype);

exports.LogPanel = LogPanel;
