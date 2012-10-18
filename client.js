var FILE = '.flowdock-prefs';

var fs = require('fs');
var _ = require('underscore');
var API = require('./flowdock-api');
var UI = require('./chat-term-ui');

var session = new API.Session(USER, PASS);
var flow = session.flow(FLOW);
var users_by_id = {};
var users_by_nick = {};

var startResponding = function() {
  var ui = new UI();
  flow.on('message', function(message) {
    if(typeof message.content === "string") {
      var nick = users_by_id[message.user].nick;
      ui.showChat(nick, message.content);
    }
  });
  flow.on('error', _.bind(ui.showError, ui));
  session.on('error', _.bind(ui.showError, ui));

  ui.on('typedChat', function(msg) {
    flow.sendMessage(msg);
  });
  ui.on('close', function() {
    process.exit();
  });
};

flow.getDetails(function(details) {
  _.each(details.users, function(user) {
    users_by_id[user.id] = user;
    users_by_nick[user.nick] = user;
  });
  startResponding();
});

