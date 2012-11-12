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
 @requires keypress
 @requires child_process
**/
var repl    = require('repl')
  , utils   = require('utilities')
  , keypress = require('keypress')
  , spawn   = require('child_process').spawn
  , Server  = require('./server.js').Server
  , bindToContext
  , findCompletion
  , sortCompletions

keypress(process.stdin);

bindToContext = function(context, replContext) {
  context.context = utils.mixin(replContext, context.context, context);

  return context.context;
};

findCompletion = function(completions, line, showAll) {
  var found
  
  found = completions.sort(function (a, b){
            if ( a.length < b.length )
              return -1;
            if ( a.length > b.length )
              return 1;
            return 0; // a and b are the same length
          });

  found = found.filter(function(suspect){ return suspect.indexOf(line) == 0 });
  found = found.filter(function(suspect){ return !~ suspect.indexOf('.'); });

  return [line && line.length && found.length && found.length !== completions.length ? 
            found : 
            (showAll? completions : []), 
          line]
};

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
    The repl console prompt

    @property prompt
    @public
    @type String
  **/
  this.prompt = [this.name, '-', this.locale, '>', ' '].join('');

  /**
    The REPL console context variables

    @property context
    @public
    @type {Object}
  **/
  this.context = utils.mixin(this.context, utils.mixin(context || {}, {
    sig     : this.prompt,
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
  showAllTabCompletion : false,
  buffer               : "",
  cursor               : 0,
  completions          : [],
  history              : (function(){
    var history = []; 
    history.push = function(){
      this.constructor.prototype.push.apply(this, arguments);

      this.index = this.length -1;

      return this;
    };

    history.index = 0;

    return history;
  })(),
  context : require('./context'),
  filters : {
    processChunk    : function(chunk) { return chunk; },
    processError    : function(error) { return error; },
    processData     : function(data) { return data; },
    processBuffer   : function(buffer) { return buffer; }
  },

  getValue : function(key) {
    return (this.repl.context[key]? this.repl.context[key] : false)
  },
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
        this.repl = repl.start(this.prompt);

        this.repl.context = bindToContext(this.context, this.repl.context);
      break;

      case replconsole.REPLConsole.REMOTE_LOCALE :
        console.log([
            "Starting REPLConsole session with name".cyan, this.name.green, 
            "with locale".cyan, this.locale.green, "on port", (new String(this.port)).valueOf().green].join(' '));

        this.server.on('server.connected', function(socket){
          self.socket = socket;

          console.log("\nNew connection.  ".cyan); 
          console.log("Total connections: ".magenta + (socket.server._connections).toString().cyan);

          self.repl = repl.start(self.prompt, socket);
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

    var self = this, proc, first = true
    port = port || this.port;

    proc = spawn('telnet', [host, port]);

    proc.stdout.on('data', function(data){
      data = self.filters.processData(data);

      if (!first) {
        process.stdout.write('\n' + data.toString());
      } else {
        console.log("Connected!".magenta);
        first = false;
      }

      process.stdin.resume();
      process.stdin.setEncoding('utf8');
    });

    
    process.stdin.setRawMode(true);
    process.stdin.on('data', function (chunk) {
      if (chunk === '\u0003') {
        process.exit();
      }      

      if (! chunk.match(/[\r\n\t\b]/g) &&
          ! chunk.match(/[\u001b|\u001b|\u001b|\u001b]/g)) {

        chunk = self.filters.processChunk(chunk);

        self.buffer += (chunk.length ? chunk : "");

        process.stdout.write(chunk);
        self.cursor = self.buffer.length
      }
      else if (chunk.match(/\r/g)) {
        var cmd = self.buffer.replace(/\r/g,'').toLowerCase();

        if (cmd.split(' ').length == 1) {
          switch (cmd) {
            case 'exit' :
              console.log('\n' + "Exiting...".magenta);
              process.exit();
            break;

            default :
              self.server.emit('remote:cmd:'+ cmd, self.buffer, process.stdout);
            break;
          }
        }

        process.stdin.emit('buffer', self.buffer);
        self.buffer = "";
        self.cursor = 0;
      }
    });

    /*
      key codes


    */
    process.stdin.on('keypress', function(key, letter){
      if (! (letter && letter.name)) {
        return false;
      }

      switch (letter.name) {
        case 'tab' :
          process.stdin.emit('buffer', self.buffer + '\t', false, false, false);
        break;

        case 'backspace' :
          if (self.buffer.length === 1) {
            process.stdout.write("\b");
            self.buffer = "";
            self.cursor--;
            
          }
          else if (self.buffer.length) {
            process.stdout.write("\b");
            process.stdout.write("\u001b[D");
            
            self.buffer = self.buffer.substr(0, self.buffer.length -2);
            self.cursor -= 2;
          }
        break;

        case 'left' :
          if (! self.buffer.length) {
            process.stdout.write("");
          }
          else if (self.cursor) {
            process.stdout.write("\u001b[D");
            self.cursor--;
          }
        break;

        case 'right' :
          if (self.buffer.length && self.cursor > self.buffer.length - 1) {
            process.stdout.write("");
          }
          else if (self.buffer.length) {
            process.stdout.write("\u001b[C");
            self.cursor++;
          }
        break;

        case 'up' :
          var lastEntry, i, index

          for (i = self.buffer.length; i >- 0; i--) {
            process.stdin.emit('keypress', null, {name: 'backspace'});
          }

          index     = self.history.index > -1 ? self.history.index : ++self.history.index;
          lastEntry = self.history[index];

          if (lastEntry && lastEntry.length) {
            self.buffer = lastEntry;
            self.cursor = lastEntry.length;
            process.stdout.write(lastEntry);
          }
        break;

        case 'down' :
        /*
          var lastEntry, i, index

          for (i = self.buffer.length; i >- 0; i--) {
            process.stdin.emit('keypress', null, {name: 'backspace'});
          }

          index     = self.history.index + 1;
          lastEntry = self.history[index] ? self.history[index] : "\n";
          self.buffer = lastEntry;
          self.cursor = lastEntry.length;
          process.stdout.write(lastEntry);
        */
        break;

        default:
      }

      //console.log(letter)
    });

    process.stdin.on('buffer', function(buffer, raw, log, filter){
      var chars = '\r\n', completions, found, suspect

      if (filter !== false) {
        buffer = self.filters.processBuffer(buffer);
      }

      if (log !== false) {
        self.history.push(buffer);
      }
      
      if (buffer) {
        buffer += (raw !== false ? chars : "");

        if (buffer.match('\t') && (buffer = buffer.replace('\t', ''))) { // Enable a tab completion map
          suspect     = buffer.split(' ')[buffer.split(' ').length - 1];
          completions = findCompletion(self.completions, suspect, self.showAllTabCompletion);

          if (completions && completions.length === 2 && typeof completions[0] === 'object') {
            if (completions[0].length) {
              found = (completions[0].length > 1 && completions[0][0] !== suspect? completions[0][0] : completions[0][0] + " ");

              self.buffer = self.buffer.replace(suspect, found);
              self.cursor = self.buffer.length;
            }
            else {
              found = completions[0].join('\n');
            }
            
          }

          if (found.length) {
            process.stdout.write('\n' + found);
          }

          if (self.buffer.length !== buffer.length) {
            process.stdout.write('\n' + self.prompt + self.buffer);
          }
        }
        else {
          proc.stdin.write(buffer);
        }
      }
    });

    proc.stderr.on('data', function(error){
      if (error) {
        error = self.filters.processError(error);

        console.log('Unexpceted Error!'.red);
        console.log(error.toString().red);
        process.exit()
      }
    }); 

    return this;
  }
};

module.exports = replconsole;