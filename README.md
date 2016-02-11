## How to initialize a server and a client?

You can try this on node's REPL:

```javascript
chat = require('./lib/Chat.js');
```

And depending on the machine you are using:

#### Server
```javascript
...
server = new chat.Server();
...
```
#### Client
```javascript
...
client = new chat.Client();
client.findServer();
client.connect();
...
```

**NOTE**: You cannot run a server *and* a client on the same machine.
