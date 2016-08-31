#Koa-socket-session
***
koa-socket-session is a session middleware for [LnsooXD/koa-socket.io](https://github.com/LnsooXD/koa-socket.io).It
 can share session between koa app and koa-socket.io.
 
##Installation

```shell
$ npm install koa-socket-session
```

##Example

```js
var koa = require('koa');
var RedisStore = require('koa-redis');
var koaSession = require('koa-generic-session');
var koaSocketSession require('koa-socket-session');
var IO = require('koa-socket.io');
const http = require('http');

var app = koa();
var io = IO();
// init session
var session = koaSession({
    store: new RedisStore({...}),
	secret: '...',
	resave: true,
	saveUninitialized: true
});

// add session for app
app.use(session);

app.use( ... );

// init koa-socket-session as koa-socket's middleware
io.use(koaSocketSession(app, session));

io.on( 'message', ( ctx, data ) => {
  // get username from session
  let username = ctx.session.username;
  // print the message received and username in session
  console.log( `message: ${ data }, username: ${username}` )
});

let server = http.createServer(app.callback());

io.start(server);

app.use(function *() {
  // set username in session to 'LnsooXD'
  this.session.username = 'LnsooXD'
  this.body = 'Hello World';
});

server.listen(3000);

```
##Authors

- [LnsooXD](https://github.com/LnsooXD)

## License

- [MIT](http://spdx.org/licenses/MIT)
