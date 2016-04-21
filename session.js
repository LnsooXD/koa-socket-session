"use strict";
const co = require('co');
const Cookies = require('cookies');

exports = module.exports = function session(app, session) {
	return wrap(function *(ctx, next) {
		if (!ctx.session) {
			let handshake = ctx.socket.socket.handshake;
			ctx.url = handshake.url;
			if (!ctx.cookies) {
				ctx.cookies = new Cookies(handshake, handshake, {
					keys: app.keys,
					secure: handshake.secure
				});
			}
			yield session.call(ctx, nup());
		}
		yield next();
	});
};

function wrap(middleware) {
	return co.wrap(function *(ctx, next) {
		try {
			yield middleware(ctx, next);
		} catch (e) {
			console.log(e);
		}
	});
}

function *nup() {
}
