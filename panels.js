var _ = require('underscore');
var events = require('events');
var clc = require('cli-color');
var logger = require('./debug_logger');

var nextPanelId = 0;

var Panel = function(options) {
  options = _.defaults(options || {}, {
    offsetX: 0,
    offsetY: 0,
    name: this.getPanelType() + '_' + (++nextPanelId)
  });
  events.EventEmitter.call(this);
  _.extend(this, options);
  this.on('resize', _.bind(function() { this.onResize(); }, this));
  logger.debug('created new ' + this.getPanelType() + ' panel named ' + this.name);
};
_.extend(Panel.prototype, events.EventEmitter.prototype);

Panel.prototype.getPanelType = function() {
  return 'basic';
};

Panel.prototype.add = function(child) {
  this.child = child;
  child.parent = this;
  child.width = this.width;
  child.height = this.height;
};

Panel.prototype.updateSize = function(options) {
  var oldWidth = this.width,
      oldHeight = this.height,
      oldX = this.offsetX,
      oldY = this.offsetY;
  if (options.width)  this.width = options.width;
  if (options.height) this.height = options.height;
  if (options.offsetX) this.offsetX = options.offsetX;
  if (options.offsetY) this.offsetY = options.offsetY;
  logger.debug('updating size of ' + this.name + ': (' +
        'w' + this.width + ', ' +
        'h' + this.height + ', ' +
        'x' + this.offsetX + ', ' +
        'y' + this.offsetY + ')');
  if(this.width !== oldWidth || this.height !== oldHeight
     || this.offsetX !== oldX || this.offsetY !== oldY) {
    this.emit('resize');
  }
};

Panel.prototype.onResize = function() {
  if(this.child) {
    this.child.updateSize({
      width: this.width,
      height: this.height
    });
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

Panel.prototype.clear = function() {
  var spaces = this.fullHorizontalSpaceString();
  _.times(this.height, function(index) {
    this.placeCursor(0, index);
    this.write(spaces);
  }, this);
};

Panel.prototype.fullHorizontalSpaceString = function(spaceCharacter) {
  var spaces = '';
  spaceCharacter = spaceCharacter || ' ';
  _.times(this.width, function() { spaces += spaceCharacter; });
  return spaces;
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

SplitPanel.prototype.getPanelType = function() {
  return 'split';
};
SplitPanel.prototype.render = function() {
  this.topSplit.render();
  this.bottomSplit.render();
  this.renderBar();
};

SplitPanel.prototype.renderBar = function() {
  var spaces = this.fullHorizontalSpaceString('-');
  this.placeCursor(0, this.barY);
  this.write(clc.bgBlue(spaces));
};

exports.SplitPanel = SplitPanel;

var TTYPanel = function(tty) {
  Panel.call(this, {
    tty: tty,
    width: tty.columns,
    height: tty.rows,
    name: 'ttypanel'
  });
  tty.on('resize', _.bind(this.updateSizeFromTTY, this));
};
_.extend(TTYPanel.prototype, Panel.prototype);

TTYPanel.prototype.getPanelType = function() {
  return 'tty';
};

TTYPanel.prototype.updateSizeFromTTY = function() {
  this.updateSize({
    width: this.tty.columns,
    height: this.tty.rows
  });
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
