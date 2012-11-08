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
/**
 @module server
**/
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

var server = {};

/**
  Constructs a new instance of a Server

  @class Server
  @constructor
  @extends EventEmitter
  @param {String} name The name of the server
**/
server.Server = function(name) {
  /**
    The server name

    @property name
    @public
    @type String
  **/
  this.name = name || "anon";
};

server.Server.prototype = {
  _instance     : null,
  _initialized  : false,
  _connections  : {},

  /**
    Connects to a server. Emits a 'server.connected' event.

    @method initialize
    @public
  **/
  initialize : function() {
    var self = this

    this._instance = net.createServer(function(){
      emit(self, [server.Server.SERVER_CONNECTED], arguments);
    });

    this._initialized = true;

    return this;
  },

  /**
    @method start
    @public
    @description Starts the server listening on a port
    @param {Number} port The port to listen on
  **/
  start : function(port) {
    if (this._initialized !== true || typeof this._instance !== 'object') {
      return false;
    }

    this._instance.listen(port || 4000);

    return this;
  },

  /**
    @method connect
    @public
    @description Connects to a given host and port. Emits a 'connection.connected' event.
    @param {Number} port The port to connect to
    @param {String} host The host to connect to
  **/
  connect : function(port, host) {
    var self = this, guid = genGuid(this._connections)

    net.createConnection(port, host, function(){
      var socket = this

      self._connections[guid] = socket;

      socket.on('data', function(connection){
        emit(self, [server.Server.CONNECTION_DATA], arguments);
      });

      socket.on('end', function(connection){
        emit(self, [server.Server.CONNECTION_END], arguments);
      });

      socket.on('timeout', function(connection){
        emit(self, [server.Server.CONNECTION_TIMEOUT], arguments);
      });

      socket.on('drain', function(connection){
        emit(self, [server.Server.CONNECTION_DRAIN], arguments);
      });

      socket.on('error', function(connection){
        emit(self, [server.Server.CONNECTION_ERROR], arguments);
      });

      socket.on('close', function(connection){
        emit(self, [server.Server.CONNECTION_CLOSE], arguments);
      });

      arguments[arguments.length -1] = socket;
      emit(self, [server.Server.CONNECTION_CONNECTED], arguments);
    })
  }
};

/**
  Fired when the server recieves a connection

  @event SERVER_CONNECTED 
  @final
  @static
  @type {String}
**/
server.Server.SERVER_CONNECTED = 'server.connected';

/**
  Fired when a connection to a server emits data

  @event CONNECTION_DATA 
  @final
  @static
  @type {String}
**/
server.Server.CONNECTION_DATA = 'connection.data';

/**
  Fired when a connection to a server ends

  @event CONNECTION_END
  @final
  @static
  @type {String}
**/
server.Server.CONNECTION_END = 'connection.end';

/**
  Fired when a connection to a servers write buffer becomes empty. Can be used to throttle uploads.

  @event CONNECTION_DRAIN
  @final
  @static
  @type {String}
**/
server.Server.CONNECTION_DRAIN = 'connection.drain';

/**
  Fired when a connection to a server encounters an error

  @event CONNECTION_ERROR
  @final
  @static
  @type {String}
**/
server.Server.CONNECTION_ERROR = 'connection.error';

/**
  Fired when a connection to a server closes

  @event CONNECTION_CLOSE
  @final
  @static
  @type {String}
**/
server.Server.CONNECTION_CLOSE = 'connection.close';

/**
  Fired when a connection to a server is established

  @event CONNECTION_CONNECTED
  @final
  @static
  @type {String}
**/
server.Server.CONNECTION_CONNECTED = 'connection.connected';

/**
  Fired when a connection to a server times out

  @event CONNECTION_TIMEOUT
  @final
  @static
  @type {String}
**/
server.Server.CONNECTION_TIMEOUT = 'connection.timeout';

// Inherit the EventEmitter
server.Server.prototype = utils.mixin(server.Server.prototype, events.EventEmitter.prototype);

module.exports = server;