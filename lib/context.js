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
 @module context
 @requires utilities
**/
var utils = require('utilities')

/**
  @class context
**/
var context = {};

/**
  @property context
  @public
  @type Object
  @description The repl context scope
**/
context._context = {};
context.__defineSetter__('context', function(val){
  this._context = val;
});

context.__defineGetter__('context', function(){
  return this._context;
});

/**
  @method exit
  @public
  @static
  @description Exits the repl console session
**/
context.exit = function(message) {
  console.log((message || "Exiting..").red);
  process.exit();
};

/**
  @method assign
  @public
  @static
  @description Assigns a variable to the context
  @param {Mixed} key The key to reference the variable being assigned, if an object is passed
  each key in the object is mapped as a variable.
  @param {Mixed} val The value of the variable being assigned
  @return context
**/
context.assign = function(key, val) {
  var prop

  if (typeof key === 'object') {
    for (prop in key) {
      context.assign(prop, key[prop]);
    }
  }
  else {
    this[key] = val;
    context.context[key] = val;
  }

  return this;
};

/**
  @property utils
  @public
  @static
  @type {Object}
  @description Utility object
**/
context.utils = utils.mixin(utils, {

});

module.exports = context;