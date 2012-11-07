# repl-console
#### A simple REPL Console. Local & remote.

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

This session is now running as a server on port 4000. You can now use a simple UNIX program
such as `telnet` to connect locally or from a remote machine.
```
$ telnet localhost 4000
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
my-session-remote> name
'joseph'
```