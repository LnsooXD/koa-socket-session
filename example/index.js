const Koa = require('koa')
const IO = require('koa-socket.io')
const sessionIO = require('../');
const http = require('http');
const debug = require('debug')('koa-socket.io:example');
const compose = require('koa-compose');
const KoaSession = require('koa-session');

const CONFIG = {
    key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
    maxAge: 86400000, /** (number) maxAge in ms (default is 1 days) */
    overwrite: true, /** (boolean) can overwrite or not (default true) */
    httpOnly: true, /** (boolean) httpOnly or not (default true) */
    signed: true, /** (boolean) signed or not (default true) */
};

const app = new Koa()

app.keys = ['some secret hurr'];

const session = KoaSession(CONFIG, app);
app.use(session);

const io = new IO({
    namespace: '/'
})

app.use(async (ctx, next) => {
    let n = ctx.session.views || 0;
    debug("app session: %s", n);
    ctx.session.views = ++n;
    await next();
});

app.use(require('koa-static')('./public'));

let options = {
    /* socket.io options */
}

let server = http.createServer(app.callback());

io.start(server, options/*, port, host */)

// The chatroom code below is modify from: https://github.com/socketio/socket.io/tree/master/examples/chat
// Chatroom
let numUsers = 0;

// session middleware
io.use(sessionIO(app, session));

// common function event handler
io.on('connect', async (ctx, next) => {

    debug('someone connect: %s', ctx.id);

    const socket = ctx.socket;
    let addedUser = false;

    // when the client emits 'add user', this listens and executes
    socket.on('add user', async (ctx) => {
        if (addedUser) {
            return;
        }

        // we store the username in the socket session for this client
        ctx.username = ctx.data;

        debug('user joined: %s', ctx.username);

        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast('user joined', {
            username: ctx.username,
            numUsers: numUsers
        });
    });

    // when the client emits 'new message', this listens and executes
    socket.on('new message', async (ctx) => {
        let n = ctx.session.views || 0;
        ctx.session.views = ++n;

        debug('new message: %s, session: %s', ctx.data, n);

        // we tell the client to execute 'new message'
        socket.broadcast('new message', {
            username: ctx.username,
            message: ctx.data
        });
    });


    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', async (ctx) => {
        debug('typing: %s', ctx.username);
        socket.broadcast('typing', {
            username: ctx.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', async (ctx) => {
        debug('stop typing: %s', ctx.username);
        socket.broadcast('stop typing', {
            username: ctx.username
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', async (ctx) => {
        if (addedUser) {
            debug('user left: %s', ctx.username);
            --numUsers;

            // echo globally that this client has left
            socket.broadcast('user left', {
                username: ctx.username,
                numUsers: numUsers
            });
        }
    });
});

let port = 3000;
let host = 'localhost';

server.on('error', function (error) {
    debug(error);
})

server.listen(port, host, function () {
    debug('server listen on: http://' + host + ':' + port);
});



