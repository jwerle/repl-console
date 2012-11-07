/*
 * REPL Console
 * Copyright 2012 Joseph Werle (joseph.werle@gmail.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*
 @name server
 @module server
 @requires colors
 @requires net
 @requires events
 @requires utilities
 @requires colors
*/
require('colors');

var net     = require('net')
  , events  = require('events')
  , utils   = require('utilities')
  , emit
  , genGuid

emit = function(server, events, args) {
  server.emit.apply(server, events.concat(Array.prototype.splice.apply(args, [0])));
}

genGuid = function(map) {
  var guid = Math.floor(Math.random() * (10<<10^10));

  return (map[guid] ? genGuid(map) : guid);
}

/**
  @name server
  @namespace server
*/
var server = {};

/**
  @name Server
  @constructor
  @extends EventEmitter
  @description Constructs a new instance of a Server
  @param {String} name The name of the server
*/
server.Server = function(name) {
  /*
    @name Server#name
    @public
    @type String
    @description The server name
  */
  this.name = name || "Anonymous";
};

/*
  @scope Server.prototype
*/
server.Server.prototype = {
  _instance     : null,
  _initialized  : false,
  _connections  : {},

  /*
    @name Server#connect
    @public
    @function
    @description Connects to a server. Emits a 'server.connected' event.
  */
  initialize : function() {
    var self = this

    this._instance = net.createServer(function(){
      emit(self, ['server.connected'], arguments);
    });

    this._initialized = true;

    return this;
  },

  /*
    @name Server#start
    @public
    @function
    @description Starts the server listening on a port
    @param {Number} port The port to listen on
  */
  start : function(port) {
    if (this._initialized !== true && typeof this._instance === 'object') {
      return false;
    }

    this._instance.listen(port || 4000);

    return this;
  },

  /*
    @name Server#connect
    @public
    @function
    @description Connects to a given host and port. Emits a 'connection.connected' event.
    @param {Number} port The port to connect to
    @param {String} host The host to connect to
  */
  connect : function(port, host) {
    var self = this, guid = genGuid(this._connections)

    net.createConnection(port, host, function(){
      var socket = this

      self._connections[guid] = socket;

      socket.on('data', function(connection){
        emit(self, ['connection.data'], arguments);
      });

      socket.on('end', function(connection){
        emit(self, ['connection.end'], arguments);
      });

      socket.on('timeout', function(connection){
        emit(self, ['connection.timeout'], arguments);
      });

      socket.on('drain', function(connection){
        emit(self, ['connection.drain'], arguments);
      });

      socket.on('error', function(connection){
        emit(self, ['connection.error'], arguments);
      });

      socket.on('close', function(connection){
        emit(self, ['connection.close'], arguments);
      });

      arguments[arguments.length -1] = socket;
      emit(self, ['connection.connected'], arguments);
    })
  }
};

// Inherit the EventEmitter
server.Server.prototype = utils.mixin(server.Server.prototype, events.EventEmitter.prototype);

/*
  @exports server
*/
module.exports = server;
