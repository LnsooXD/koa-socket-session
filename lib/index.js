"use strict";

/*!
 * koa-socket-session
 * Copyright(c) 2017 LnsooXD
 * MIT Licensed
 */

const Cookies = require('cookies');
const not = require('not-type-of');
const debug = require('debug')('koa-socket-session:session');
const accepts = require('accepts');

exports = module.exports = function session(app, session) {
    debug('new koa socket session');

    return async function socketSession(ctx, next) {
        if (!ctx.koaContext) {
            const request = ctx.packet.request;
            const response = addCookiesFuncs(ctx.packet.handshake);
            ctx.koaContext = createContext.call(app, request, response);

            ctx.cookies = new Cookies(request, response, {
                keys: app.keys,
                secure: response.secure
            });
        }
        await session(ctx.koaContext, async (err) => {
            if (!err) {
                ctx.session = ctx.koaContext.session;
            }
            await next(err);
        });
    };
};

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

function createContext(req, res) {
    const context = Object.create(this.context);
    const request = context.request = Object.create(this.request);
    const response = context.response = Object.create(this.response);
    context.app = request.app = response.app = this;
    context.req = request.req = response.req = req;
    context.res = request.res = response.res = res;
    request.ctx = response.ctx = context;
    request.response = response;
    response.request = request;
    context.originalUrl = request.originalUrl = req.url;
    context.cookies = new Cookies(req, res, {
        keys: this.keys,
        secure: request.secure
    });
    request.ip = request.ips[0] || req.socket.remoteAddress || '';
    context.accept = request.accept = accepts(req);
    context.state = {};
    return context;
}
