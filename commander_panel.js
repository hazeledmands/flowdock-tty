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
  this.buffer += chunk;
  if (key && key.ctrl && key.name == 'c') {
    process.exit();
  }
  this.placeCursor(this.cursorX, this.cursorY);
  this.write(chunk);
  this.cursorX += chunk.length;
};

CommanderPanel.prototype.resetCursor = function() {
  this.cursorX = this.prompt.length + this.buffer.length;
  this.cursorY = 0;
};

CommanderPanel.prototype.render = function() {
  this.placeCursor(0,0);
  this.write(this.prompt + this.buffer);
};

module.exports = CommanderPanel;
