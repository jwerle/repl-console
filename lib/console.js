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
 @name console
 @module console
 @requires repl
 @requires utilities
 @requires ./server.js
*/
var repl    = require('repl')
  , utils   = require('utilities')
  , Server  = require('./server.js').Server
  , bindToContext

bindToContext = function(context, replContext) {
  return utils.mixin(replContext, context);
}

/**
  @name replconsole
  @namespace replconsole
*/
var replconsole = {};

/**
  @name replconsole.REPLConsole
  @constructor
  @description Constructs a new instance of a Server
  @param {String} name The name of the console instance
  @param {String} locale The location of the repl console instance [local|remote]
  @param {Object} context An object of bind to the context of the repl console instance
  @param {Number} port The port for the remote repl server to listen on
*/
replconsole.REPLConsole = function(name, locale, context, port) {
  /*
    @name REPLConsole#name
    @public
    @type String
    @description The REPL console instance name
  */
  this.name = name || "anon";

  /*
    @name REPLConsole#locale
    @public
    @type String
    @description The REPL console instance locale
  */
  this.locale = (locale && locale.toLowerCase() === replconsole.REPLConsole.REMOTE_LOCALE ?
                  locale :
                  replconsole.REPLConsole.LOCAL_LOCALE);

  /*
    @name REPLConsole#context
    @public
    @type Object
    @description The REPL console context variables
  */
  this.context = utils.mixin(this.context, context || {});

  /*
    @name REPLConsole#repl
    @public
    @type Object
    @description The primitive repl object
  */
  this.repl = {};

  /*
    @name REPLConsole#port
    @public
    @type Object
    @description The port for the remote repl console to listen on
  */
  this.port = port || 5001;

  /*
    @name REPLConsole#server
    @public
    @type Server
    @description The repl server object
  */
  this.server = new Server(this.name);

   /*
    @name REPLConsole#sig
    @public
    @type String
    @description The repl console signature
  */
  this.sig = [this.name, '-', this.locale, '>', ' '].join('');
};

/* 
  @constant
  @type {String}
  @default
*/
replconsole.REPLConsole.LOCAL_LOCALE   = 'local';

/* 
  @constant
  @type {String}
  @default
*/
replconsole.REPLConsole.REMOTE_LOCALE  = 'remote';

/*
  @scope REPLConsole.prototype
*/
replconsole.REPLConsole.prototype = {
  context : require('./context'),
  /*
    @name REPLConsole#start
    @public
    @function
    @description Starts the repl console session
  */
  start : function() {
    var self = this

    switch (this.locale) {
      default: 
      case replconsole.REPLConsole.LOCAL_LOCALE :
        console.log(["Starting REPLConsole session with name".cyan, this.name.green, "with locale".cyan, this.locale.green].join(' '));
        this.repl = repl.start(this.sig);

        this.repl.context = bindToContext(this.context, this.repl.context);
      break;

      case replconsole.REPLConsole.REMOTE_LOCALE :
        console.log(["Starting REPLConsole session with name".cyan, this.name.green, "with locale".cyan, this.locale.green, "on port", (new String(this.port)).valueOf().green].join(' '));
        this.server.on('connect', function(socket){
          console.log("Connected to REPL Server!".cyan);

          self.repl = repl.start(self.sig, socket);
          self.repl.context = bindToContext(self.context, self.repl.context);
        });

        this.server.initialize().connect(this.port);
      break;
    }

    return this;
  },

  /*
    @name REPLConsole#start
    @public
    @function
    @description Starts the repl console session
  */
};

/*
  @exports replconsole
*/
module.exports = replconsole;