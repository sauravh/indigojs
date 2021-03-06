'use strict';

const indigo = global.__indigo;

/**
 * The indigoJS <code>rest</code> module is a simple yet powerful representation of your RESTful API.
 * By specifying <code>service:path</code> in <code>app.conf</code> you can override any indigoJS module with a custom version of your choice.
 *
 * @version 1.0
 *
 * @module
 * @mixin libs/rest
 *
 * @see https://www.npmjs.com/package/proxy-orchestrator
 *
 * @example
 * conf/app.json 
 *{
 * ...
 *	"service": 
 *	{
 *		"path": null,
 *		"host": "localhost",
 *		"port": 443,
 *		"secure": true
 *	}
 *...
 *}
 */
const rest = () => {

	return /** @lends libs/rest.prototype */ {
		/**
		 * Initializes server settings.
		 *
		 * @param {Object} opts Defined default server configuration where <code>host</code> is IP Address or
		 * domain name,  <code>port</code> server port number and <code>secure</code> communications protocol
		 * HTTP or HTTPS.
		 * @param {express.Request} req Defines an object to provide client request information.
	 	 * @param {express.Response} res Defines an object to assist a server in sending a response to the client.
		 * 
		 * @return {Object} rest Scope to the current instance.
		 *
		 * @example
		 * require('indigojs').service.init();
		 *
		 * @example
		 * require('indigojs').service.init({
		 *		host:'localhost',
		 *		port: 80
		 *	});
		 */
		init(opts, req, res) {
			opts = opts || indigo.appconf.get('service') || {};
			this.opts = opts;
			this.server = require('proxy-orchestrator')({
				host: opts.host,
				port: opts.port,
				secure: opts.secure
			}, req, res);
			this.headers = this.server.headers;
			this.timeout = opts.timeout;
			return this;
		},
		/**
		 * This function is used to request a LIST of entities or to SHOW details for a single entity.
		 * @param {Function} callback A callback function that is executed if the request completed.
		 * @param {String} path Canonical path of the router.
		 * @param {Object} [data] An object that is sent to the server with the request.
		 * @param {Object} [query] URL query parameters.
		 *
		 * @example
		 * require('indigojs').service.get(function(err, result, req, res) {
		 * 	...
		 * }, '/contextPath/getPath', null, {'framework': 'indigojs'});
		 */
		get(callback, path, data, query) {
			this.request(callback, 'GET', path, data, query);
		},
		/**
		 * This function executes HTTP POST requests. 
		 * @param {Function} callback A callback function that is executed if the request completed.
		 * @param {String} path Canonical path of the router.
		 * @param {Object} [data] An object that is sent to the server with the request.
		 * @param {Object} [query] URL query parameters.
		 *
		 * @example
		 * require('indigojs').service.post(function(err, result, req, res) {
		 * 	...
		 * }, '/contextPath/postPath', {'key':'value'});
		 */
		post(callback, path, data, query) {
			this.request(callback, 'POST', path, data, query);
		},
		/**
		 * This function sends a request and UPDATEs or REPLACEs an entity. 
		 * @param {Function} callback A callback function that is executed if the request completed.
		 * @param {String} path Canonical path of the router.
		 * @param {Object} [data] An object that is sent to the server with the request.
		 * @param {Object} [query] URL query parameters.
		 *
		 * @example
		 * require('indigojs').service.put(function(err, result, req, res) {
		 * 	...
		 * }, '/contextPath/putPath', {'id':123, 'key':'value'});
		 */
		put(callback, path, data, query) {
			this.request(callback, 'PUT', path, data, query);
		},
		/**
		 * This function is used to delete an entity.
		 * @param {Function} callback A callback function that is executed if the request completed.
		 * @param {String} path Canonical path of the router.
		 * @param {Object} [data] An object that is sent to the server with the request.
		 * @param {Object} [query] URL query parameters.
		 *
		 * @example
		 * require('indigojs').service.put(function(err, result, req, res) {
		 * 	...
		 * }, '/contextPath/deletePath', {'id':123});
		 */
		delete(callback, path, data, query) {
			this.request(callback, 'DELETE', path, data, query);
		},
		/**
		 * This function perform a partial update of an entity.
		 * @param {Function} callback A callback function that is executed if the request completed.
		 * @param {String} path Canonical path of the router.
		 * @param {Object} [data] An object that is sent to the server with the request.
		 * @param {Object} [query] URL query parameters.
		 *
		 * @example
		 * require('indigojs').service.patch(function(err, result, req, res) {
		 * 	...
		 * }, '/contextPath/patchPath', {'id':123, 'key':'value'});
		 */
		patch(callback, path, data, query) {
			this.request(callback, 'PATCH', path, data, query);
		},
		/**
		 * The inner function for building REST requests and executing from <code>get/post/put/delete/patch</code> functions.
		 * @param {Function} callback A callback function that is executed if the request completed.
		 * @param {String} method HTTP method <code>GET/POST/PUT/DELETE/PATCH</code>.
		 * @param {String} path Canonical path of the router.
		 * @param {Object} [data] An object that is sent to the server with the request.
		 * @param {Object} [query] URL query parameters.
		 */
		request(callback, method, path, data, query) {
			const proxy = this.server.request(callback, method, path, data, query);

			proxy.on('socket', socket => {
				if (this.timeout !== undefined) {
					socket.setTimeout(this.timeout);
					socket.on('timeout', () => {
						proxy.abort();
					});
				}
			});
		}
	};
};

/**
 * @module rest
 * @see {@link libs/rest}
 */
module.exports = rest;