"use strict";

/*!
 * koa-socket-session
 * Copyright(c) 2016 LnsooXD
 * MIT Licensed
 */

const Cookies = require('cookies');
const not = require('not-type-of');

exports = module.exports = function session(app, session) {
    return  function *(next) {
        let ctx = this;
        let request = ctx.socket.socket.request;
        ctx.url = request.url;

        if (!ctx.cookies) {
            let response = addCookiesFuncs(ctx.socket.socket.handshake);
            ctx.cookies = new Cookies(request, response, {
                keys: app.keys,
                secure: response.secure
            });
        }
        yield session.call(ctx, wrapNext(next, session, ctx));
    };
};

function wrapNext(next, session, ctx) {
    return function* () {
        yield next;
        session.call(ctx);
    }();
}

function addCookiesFuncs(handshake) {

    if (not.function(handshake.getHeader)) {
        handshake.getHeader = function (key) {
            return this.headers[key];
        }.bind(handshake);
    }

    if (not.function(handshake.setHeader)) {
        handshake.setHeader = function (key, value) {
            /* do nothing */
        }.bind(handshake);
    }

    return handshake;
}
