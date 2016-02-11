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

## How to send messages?

On the client you can use the following functions:

| Function | Description |
| --- | --- |
| sendMessage(uuid, message) | Send a message to client with the specified uuid |
| sendGroupMessage(uuid, message) | Send a message to the specified group |
| getMessages() | Gets all received messages |
| createGroup(name) | Creates a group with given name |
| joinGroup(uuid) | Tries to join the group with the given uuid |
| leaveGroup(uuid) | Leaves group with given uuid |
| getGroups() | Get a list of available groups |

