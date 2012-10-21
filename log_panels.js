var _ = require('underscore');
var panels = require('./panels');

var LogPanel = function(options) {
  options = _.defaults(options || {}, {
    children: []
  });
  panels.Panel.call(this, options);
};
_.extend(LogPanel.prototype, panels.Panel.prototype);

LogPanel.prototype.getPanelType = function() {
  return 'log';
};

LogPanel.prototype.add = function(child) {
  this.children.unshift(child);
  child.parent = this;
  child.width = this.width;
  this.render();
};

LogPanel.prototype.onResize = function() {
  _.each(this.children, function(child) {
    child.updateSize({ width: this.width });
  });
  this.render();
};

LogPanel.prototype.render = function() {
  var currentHeight = this.height;
  _.each(this.children, function(child) {
    child.recalculateHeight();
    currentHeight -= child.height;
    child.offsetY = currentHeight;
    child.render();
  }, this);
};

exports.LogPanel = LogPanel;

var TextItemPanel = function(options) {
  panels.Panel.call(this, options);
}
_.extend(TextItemPanel.prototype, panels.Panel.prototype);

TextItemPanel.prototype.getPanelType = function() {
  return 'textItem';
};

TextItemPanel.prototype.recalculateHeight = function() {
  if(this.text && this.width) {
    this.height = Math.ceil(this.text.length / this.width);
  } else {
    this.height = undefined;
  }
};

TextItemPanel.prototype.render = function() {
  this.clear();
  this.placeCursor(0,0);
  this.write(this.text);
};

exports.TextItemPanel = TextItemPanel;
