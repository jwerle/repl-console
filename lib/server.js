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
 @requires net
 @requires events
 @requires utilities
 @requires colors
*/
require('colors');

var net     = require('net')
  , events  = require('events')
  , utils   = require('utilities')


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
server.Server = function(name, console) {
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

  /*
    @name Server#connect
    @public
    @function
    @description Connects to a server
  */
  initialize : function() {
    var self = this

    this._instance = net.createServer(function(){
      self.emit.apply(self, ['connect'].concat(Array.prototype.splice.apply(arguments, [0])));
    });

    this._initialized = true;

    return this;
  },

  /*
    @name Server#connect
    @public
    @function
    @description Connects the server to a port
    @param {Number} The port to listen on
  */
  connect : function(port) {
    if (this._initialized !== true && typeof this._instance === 'object') {
      return false;
    }

    this._instance.listen(port || 4000);

    return this;
  }
};

// Inherit the EventEmitter
server.Server.prototype = utils.mixin(server.Server.prototype, events.EventEmitter.prototype);

/*
  @exports server
*/
module.exports = server;
