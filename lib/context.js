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
 @name context
 @module context
*/

/**
  @name context
  @namespace context
*/
var context = {};

/*
  @name context.exit
  @public
  @function
  @description Exits the repl console session
*/
context.exit = function(message) {
  console.log((message || "Exiting..").red);
  process.exit();
};

/*
  @exports context
*/
module.exports = context;