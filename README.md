repl-console
============

### A simple REPL Console. Local & remote.

### Setup
```
$ npm install -g repl-console
```

### Starting a local console session only
```
$ repl-console start my-session local
Starting REPL Console session...
Starting REPLConsole session with name my-session with locale local
my-session-local> foo = 'bar';
'bar'
my-session-local> foo
'bar'
```

### Starting a remote console session
```
$ repl-console start my-session remote 4000
Starting REPL Console session...
Starting REPLConsole session with name my-session with locale remote on port 4000
Starting local REPL Console session...
Starting REPLConsole session with name my-session with locale local
my-session-local> name = 'joseph';
```

This session is now running as a server on port 4000. You can now use the connect
command to connect to the remote repl console.
```
$ repl-console connect localhost 4000
Connecting to localhost on 4000
Connected!
my-session-remote> name
'joseph'
```


Copyright and license
---------------------

Copyright 2012

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this work except in compliance with the License.
You may obtain a copy of the License in the LICENSE file, or at:

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

- - -
repl-console copyright 2012
joseph.werle@gmail.com