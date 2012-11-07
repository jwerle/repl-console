#!/usr/bin/env node

/*
 * REPL Console
 * Copyright 2012 John Doe (john.doe@email.com)
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

opts = [
    { full: 'start' }
];

parser = new parseopts.Parser(opts);
parser.parse(args);
cmds = parser.cmds;
opts = parser.opts;

switch (cmds[0]) {
  case 'start' :
    console.log("Starting REPL Console session...".green);
    replSession = new REPLConsole(cmds[1], cmds[2], {
      name    : cmds[1] || 'anon',
      locale  : cmds[2] || 'local'
    }, cmds[3]);

    replSession.start();

    if (cmds[2] === 'remote') {
      console.log("Starting local REPL Console session...".green);
      replLocal = new REPLConsole(cmds[1], 'local', {

      }, cmds[3]);

      replLocal.start();
    }
  break;
}