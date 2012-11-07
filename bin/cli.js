#!/usr/bin/env node

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

require('colors');

var REPLConsole = require('../lib/console').REPLConsole
  , parseopts   = require('../deps/parseopts')
  , args        = process.argv.slice(2)
  , replSession
  , replLocal
  , parser
  , opts
  , name
  , locale
  , port
  , host

opts = [];

parser = new parseopts.Parser(opts);
parser.parse(args);
cmds = parser.cmds;
opts = parser.opts;

name    = cmds[1] || 'anon';
locale  = cmds[2] || 'local';
port    = cmds[3] || false;

switch (cmds[0]) {
  case 'start' :
    console.log("Starting REPL Console session...".green);
    replSession = new REPLConsole(name, locale, port);

    replSession.assign({
      name    : name,
      locale  : locale
    });

    replSession.start();

    if (locale === 'remote') {
      console.log("Starting local REPL Console session...".green);
      replLocal = new REPLConsole(name, 'local', port);

      replLocal.start();
    }
  break;

  case 'connect' :
    host = name;
    port = locale;
    replConnection = new REPLConsole(name, 'local', port);

    replConnection.connect(port, host);
  break;
}

