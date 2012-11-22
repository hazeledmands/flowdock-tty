var FLOWDOCK_API_URL = 'https://api.flowdock.com';

var util = require('util');
var _ = require('underscore');
var flowdock_stream = require('flowdock');
var request = require('request');
var url = require('url');

var baseUrl = function() {
  return url.parse(FLOWDOCK_API_URL);
};

var Session = function(email, password) {
  this.email = email;
  this.password = password;
  this.streamer_session = new flowdock_stream.Session(email, password);
  events.EventEmitter.call(this);
};
util.inherits(Session, events.EventEmitter);

Session.prototype.apiCall = function(path, options, callback) {
  var self = this;
  var uri = baseUrl();
  uri.path = path;
  options = _.defaults(options, {
    uri: uri,
    headers: {
      Authorization: "Basic " + new Buffer(self.email + ":" + self.password).toString('base64'),
      Accept: 'application/json'
    }
  });
  return request(options, function(error, res, body) {
    if(error) {
      self.emit('error', 'Couldn\'t connect to Flowdock');
      return;
    }
    if(res.statusCode > 300) {
      self.emit('error', res.statusCode);
      return;
    }
    if(_.isFunction(callback)) {
      if(options.jsonResponse) {
        body = JSON.parse(body.toString('utf8'));
      }
      callback(body);
    }
  });
};
Session.prototype.getCall = function(path, callback) {
  return this.apiCall(path, { method: "GET", jsonResponse: true }, callback);
}
Session.prototype.postCall = function(path, data, callback) {
  return this.apiCall(path, { method: "POST", json: data }, callback);
}

Session.prototype.flow = function(flowName) {
  return new Flow(flowName, this);
};

var Flow = function(flowName, session) {
  this.name = flowName;
  this.session = session;
  this.stream = this.session.streamer_session.stream(flowName);
  this.stream.on('message', _.bind(this.gotMessage, this));
  this.stream.on('error', _.bind(this.gotError, this));
  events.EventEmitter.call(this);
};
util.inherits(Flow, events.EventEmitter);

Flow.prototype.gotMessage = function(message) {
  this.emit('message', message);
};
Flow.prototype.gotError = function(error) {
  this.emit('error', error);
};
Flow.prototype.getPath = function() {
  return '/flows/' + this.name;
};
Flow.prototype.getDetails = function(callback) {
  this.session.getCall(this.getPath(), callback);
};
Flow.prototype.sendMessage = function(message, callback) {
  this.session.postCall(this.getPath() + '/messages', { event: "message", content: message }, callback);
};

exports.Session = Session;
exports.Flow = Flow;
