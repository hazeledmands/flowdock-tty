var _ = require('underscore');
var events = require('events');
var clc = require('cli-color');

var Panel = function(parent, width, height) {
  events.EventEmitter.call(this);
  this.parent = parent;
  this.width = width;
  this.height = height;
  this.on('resize', _.bind(Panel.prototype.onResize, this));
};
_.extend(Panel.prototype, events.EventEmitter.prototype);

Panel.prototype.updateSize = function(width, height) {
  var oldWidth = this.width,
      oldHeight = this.height;
  this.width = width;
  this.height = height;
  if(width !== oldWidth || height !== oldHeight) {
    this.emit('resize');
  }
};

Panel.prototype.onResize = function() {
  if(this.child) {
    this.child.updateSize(this.width, this.height);
  }
  this.render();
};

Panel.prototype.render = function() {
  if(this.child) {
    this.child.render();
  }
};

Panel.prototype.draw = function(string, x, y) {
  this.parent.draw(string, x, y);
};

Panel.prototype.split = function(bottomHeight) {
  this.child = new SplitPanel(this, this.width, this.height, bottomHeight);
};

exports.Panel = Panel;

var SplitPanel = function(parent, width, height, bottomHeight) {
  var bottomHeight;

  Panel.call(this, parent, width, height);
  this.bottomHeight = bottomHeight;

  bottomHeight = this.bottomHeight || Math.floor(height / 2);
  this.barY = height - (bottomHeight + 1);
  this.topSplit = new Panel(this, width, this.barHeight);
  this.bottomSplit = new Panel(this, width, bottomHeight);

};
_.extend(SplitPanel.prototype, Panel.prototype);

SplitPanel.prototype.onResize = function() {
};

SplitPanel.prototype.render = function() {
  this.topSplit.render();
  this.bottomSplit.render();
  this.drawBar();
};

SplitPanel.prototype.drawBar = function() {
  var spaces = '';
  _.times(this.width, function() { spaces += '-'; });
  this.draw(clc.bgYellow(spaces), 0, this.barY);
};

exports.SplitPanel = SplitPanel;

var TTYPanel = function(tty) {
  Panel.call(this, tty, tty.columns, tty.rows);
  this.tty = tty;
  tty.on('resize', _.bind(this.updateSizeFromTTY, this));
};
_.extend(TTYPanel.prototype, Panel.prototype);

TTYPanel.prototype.updateSizeFromTTY = function() {
  this.updateSize(this.parent.width, this.parent.height);
};

TTYPanel.prototype.draw = function(string, x, y) {
  this.tty.write(clc.moveTo(x,y));
  this.tty.write(string);
};

TTYPanel.prototype.render = function() {
  this.tty.write(clc.reset);
  Panel.prototype.render.call(this);
};

exports.TTYPanel = TTYPanel;
