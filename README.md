#Koa-socket-session
***
koa-socket-session is a session middleware for [LnsooXD/koa-socket.io](https://github.com/LnsooXD/koa-socket.io).It
 can share session between koa app and koa-socket.io.
 
##Installation

```shell
$ npm install koa-socket-session
```

##Example

> A chat room example can be found under example dir.

```js
var koa = require('koa');
var koaSession = require('koa-session');
var koaSocketSession require('koa-socket-session');
var IO = require('koa-socket.io');
const http = require('http');

var app = koa();
var io = IO();

const CONFIG = {
    key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
    maxAge: 86400000, /** (number) maxAge in ms (default is 1 days) */
    overwrite: true, /** (boolean) can overwrite or not (default true) */
    httpOnly: true, /** (boolean) httpOnly or not (default true) */
    signed: true, /** (boolean) signed or not (default true) */
};

app.keys = ['some secret hurr'];

// init session
var session = koaSession({
	secret: '...',
	resave: true,
	saveUninitialized: true
});

const session = KoaSession(CONFIG, app);
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
