var _ = require('underscore');
var events = require('events');
var clc = require('cli-color');

var Panel = function(options) {
  options = _.defaults(options, {
    offsetX: 0,
    offsetY: 0
  });
  events.EventEmitter.call(this);
  _.extend(this, options);
  this.on('resize', _.bind(Panel.prototype.onResize, this));
};
_.extend(Panel.prototype, events.EventEmitter.prototype);

Panel.prototype.add = function(child) {
  this.child = child;
  child.parent = this;
  child.width = this.width;
  child.height = this.height;
};

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

Panel.prototype.write = function(string) {
  this.parent.write(string);
};

Panel.prototype.placeCursor = function(x, y) {
  this.parent.placeCursor(this.offsetX + x, this.offsetY + y);
};

Panel.prototype.split = function(bottomHeight) {
  this.child = new SplitPanel({
    parent: this,
    width: this.width,
    height: this.height,
    bottomHeight: bottomHeight
  });
  return this.child;
};

exports.Panel = Panel;

var SplitPanel = function(options) {
  Panel.call(this, options);
  bottomHeight = this.bottomHeight || Math.floor(this.height / 2);
  this.barY = this.height - (bottomHeight + 1);
  this.topSplit = new Panel({
    parent: this,
    width: this.width,
    height: this.barY
  });
  this.bottomSplit = new Panel({
    parent: this,
    width: this.width,
    height: bottomHeight,
    offsetY: (this.barY + 1)
  });
};
_.extend(SplitPanel.prototype, Panel.prototype);

SplitPanel.prototype.onResize = function() {
};

SplitPanel.prototype.render = function() {
  this.topSplit.render();
  this.bottomSplit.render();
  this.renderBar();
};

SplitPanel.prototype.renderBar = function() {
  var spaces = '';
  _.times(this.width, function() { spaces += '-'; });
  this.placeCursor(0, this.barY);
  this.write(clc.bgYellow(spaces));
};

exports.SplitPanel = SplitPanel;

var TTYPanel = function(tty) {
  Panel.call(this, {
    tty: tty,
    width: tty.columns,
    height: tty.rows
  });
  tty.on('resize', _.bind(this.updateSizeFromTTY, this));
};
_.extend(TTYPanel.prototype, Panel.prototype);

TTYPanel.prototype.updateSizeFromTTY = function() {
  this.updateSize(this.tty.width, this.tty.height);
};

TTYPanel.prototype.write = function(string) {
  this.tty.write(string);
};

TTYPanel.prototype.placeCursor = function(x, y) {
  this.tty.write(clc.moveTo(x,y));
};

TTYPanel.prototype.render = function() {
  this.tty.write(clc.reset);
  Panel.prototype.render.call(this);
};

exports.TTYPanel = TTYPanel;
