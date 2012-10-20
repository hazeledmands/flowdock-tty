var _ = require('underscore');
var keypress = require('keypress');
var panels = require('./panels');

var CommanderPanel = function(options) {
  options = _.defaults(options, {
    focused: true,
    inputStream: process.stdin,
    prompt: "> "
  });
  panels.Panel.call(this, options);
  keypress(this.inputStream);
  this.buffer = '';
  this.resetCursor();
  this.inputStream.on('keypress', _.bind(CommanderPanel.prototype.onKeypress, this));
};
_.extend(CommanderPanel.prototype, panels.Panel.prototype);

CommanderPanel.prototype.onKeypress = function(chunk, key) {
  if(!this.focused) return;
  if(key.name === "enter") {
    return this.commandComplete();
  }
  if(chunk) {
    this.buffer += chunk;
    this.placeCursor(this.cursorX, this.cursorY);
    this.write(chunk);
    this.cursorX += chunk.length;
  }
};

CommanderPanel.prototype.resetCursor = function() {
  this.cursorX = this.prompt.length + this.buffer.length;
  this.cursorY = 0;
};

CommanderPanel.prototype.render = function() {
  this.placeCursor(0,0);
  this.write(this.prompt + this.buffer);
};

CommanderPanel.prototype.commandComplete = function() {
  this.buffer = '';
  this.clear();
  this.render();
  this.resetCursor();
};

exports.CommanderPanel = CommanderPanel;
