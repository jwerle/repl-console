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
 @module console
 @requires repl
 @requires utilities
 @requires child_process
**/
var repl    = require('repl')
  , utils   = require('utilities')
  , spawn   = require('child_process').spawn
  , Server  = require('./server.js').Server
  , bindToContext

bindToContext = function(context, replContext) {
  context.context = utils.mixin(replContext, context.context, context);

  return context.context;
}

// Namespace
var replconsole = {};

/**
  Constructs a new instance of a Server

  @class REPLConsole
  @constructor
  @param {String} name The name of the console instance
  @param {String} locale The location of the repl console instance [local|remote]
  @param {Number} port The port for the remote repl server to listen on
  @param {Object} context An object to bind to the context of the repl console instance
**/
replconsole.REPLConsole = function(name, locale, port, context) {
  /**
    The REPL console instance name

    @property name
    @public
    @type {String}
    @default "anon"
  **/
  this.name = name || "anon";

  /**
    The REPL console instance locale

    @property locale
    @public
    @type {String}
    @default "local"
  **/
  this.locale = (locale && locale.toLowerCase() === replconsole.REPLConsole.REMOTE_LOCALE ?
                  locale :
                  replconsole.REPLConsole.LOCAL_LOCALE);

  /**
    The primitive repl object

    @property repl
    @public
    @type {Object}
  **/
  this.repl = {};

  /**
    The port for the remote repl console to listen on

    @property port
    @public
    @type {Object}
    @default "5001"
  **/
  this.port = port || 5001;

  /**
    The repl server object

    @property server
    @public
    @type {Server}
  **/
  this.server = new Server(this.name);

  /**
    The repl console signature

    @property sig
    @public
    @type String
  **/
  this.sig = [this.name, '-', this.locale, '>', ' '].join('');

  /**
    The REPL console context variables

    @property context
    @public
    @type {Object}
  **/
  this.context = utils.mixin(this.context, utils.mixin(context || {}, {
    sig     : this.sig,
    port    : this.port,
    server  : this.server,
    locale  : this.locale,
    name    : this.name
  }));
};

/**
  Local locale connstant

  @property LOCAL_LOCALE
  @static
  @final
  @type {String}
  @default
**/
replconsole.REPLConsole.LOCAL_LOCALE   = 'local';

/**
  Remote locale connstant

  @property REMOTE_LOCALE
  @static
  @final
  @type {String}
  @default
**/
replconsole.REPLConsole.REMOTE_LOCALE  = 'remote';

replconsole.REPLConsole.prototype = {
  context : require('./context'),
  /**
    Starts the repl console session

    @method start
    @public
    @chainable
    @async
  **/
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
        console.log([
            "Starting REPLConsole session with name".cyan, this.name.green, 
            "with locale".cyan, this.locale.green, "on port", (new String(this.port)).valueOf().green].join(' '));

        this.server.on('server.connected', function(socket){
          console.log("\nNew connection.  ".cyan); 
          console.log("Total connections: ".magenta + (socket.server._connections).toString().cyan);

          self.repl = repl.start(self.sig, socket);
          self.repl.context = bindToContext(self.context, self.repl.context);
        });

        this.server.initialize().start(this.port);
      break;
    }

    return this;
  },

  /**
    Shortcut to context.assign() to assign

    @method assign
    @public
    @chainable
    @param {String} key The key to reference the variable being assigned
    @param {Mixed} val The value of the variable being assigned
  **/
  assign : function() {
    this.context.assign.apply(this.repl.context, arguments);

    return this;
  },


  /**
    Connects to a remote repl console server using telnet

    @method connect
    @public
    @chainable
    @async
    @param {Number} port Port override value. Will override the port set by the instance
  **/
  connect : function(port, host) {
    console.log(["Connecting to".cyan, host.green, 'on', port].join(' '));

    var self = this, proc, first = true, sig
    port = port || this.port;

    proc = spawn('telnet', [host, port]);

    proc.stdout.on('data', function(data){
      if (!first) {
        process.stdout.write(data.toString());
      } else {
        console.log("Connected!".magenta);
        first = false;
      }

      process.stdin.resume();
      process.stdin.setEncoding('utf8');
    });

    process.stdin.on('data', function (chunk) {
      proc.stdin.write(chunk);
      process.stdin.pause();
    });

    proc.stderr.on('data', function(error){
      console.log('Unexpceted Error!'.red);
      console.log(error.toString().red);
      process.exit()
    });


    return this;
  }
};

module.exports = replconsole;