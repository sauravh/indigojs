'use strict';

var debug = require('debug')('indigo:errorHandler'),
	indigo;

/**
 * An exception reporting an error that occurred during HTTP request.
 * @mixin libs/errorHandler
 * @param {Object} appconf An application configuration.
 */
var errorHandler = function(appconf) {

	indigo = require('../indigo');

	return function(err, req, res, next) {
		if (err) {

			var model = {
					code: res.statusCode
				},
				template = appconf.get('errors:template'),
				url = appconf.get('errors:' + res.statusCode);

			if (res.statusCode === 404) {
				model.message = 'Not Found';
				model.details = 'The requested URL was not found on this server: <code>' + req.url + '</code>';
			} else if (res.statusCode ===500) {
				model.message = 'Internal Server Error';
				model.details = 'The server encountered an unexpected condition.';
			} else if (res.statusCode ===503) {
				model.message = 'Service Unavailable';
				model.details = 'Connection refuse.';
			} else {
				model.message = 'System Error';
				model.details = 'Please contact your system administrator.';
			}

			debug(model);

			if (url && url.length > 0){
				res.redirect(url);
			} else {
				res.render(__appDir + (template || '/examples/templates/errors.html'), model);
			}
			return;
		}
		next(err);
	};
};

/**
 * Error handler of runtime errors during rendering EJS templates.
 * @see <code>app.locals.inject</code> {@link indigo#start}
 * @memberof libs/errorHandler
 * @alias injectErrorHandler
 * @param {Object} err Contains information about errors.
 * @return Object
 */
errorHandler.injectErrorHandler = function(err) {
	return errorHandler.error('ERROR_INJECT', err,
		'<h3>Internal error. Please contact your system administrator</h3><br/>Code: %UID%');
};

/**
 * Error handler compiling less files to css.
 * @see {@link module:libs/middleware}
 * @memberof libs/errorHandler
 * @alias lessErrorHandler
 * @param {Object} err Contains information about errors.
 * @return Object
 */
errorHandler.lessErrorHandler = function(err) {
	return errorHandler.error('ERROR_LESS_PARSING', err, 'Unable to parse file. Code: %UID%');
};

/**
 * Logging an error message and assigning an uinque system id for each error.
 * @memberof libs/errorHandler
 * @alias error
 * @param {String} errorId Error id assigning for each function hanlder.
 * @param {Object} err Contains information about errors.
 * @param {String} message Error description.
 * @return Object
 */
errorHandler.error = function(errorId, err, message) {
	var uid = new Date().getTime().toString();
	debug(err.toString());
	indigo.logger.error('%s: %s - ', errorId, uid, err.toString());
	return {
		id: errorId,
		uid: uid,
		error: err.toString(),
		message: message.replace('%UID%', uid)
	};
};

/**
 * Utility for output error JSON response on the client REST request.
 * @param {express.Request} req Defines an object to provide client request information.
 * @param {express.Response} res Defines an object to assist a server in sending a response to the client.
 * @param {String} [errorKey] Error code id defined in <code>error.json</code> under locales directory.
 * @param {Number} [errorCode] HTTP error code (default is 400).
 */
errorHandler.json = function(req, res, errorKey, errorCode) {
	var locales = indigo.getLocales(req);
	res.json(errorCode || 400, { error: locales.errors ? locales.errors[errorKey] : errorKey });
};

/**
 * An exception reporting an error that occurred during HTTP request.
 * @module libs/errorHandler
 * @version 1.0
 * See {@link libs/errorHandler}
 */
module.exports = errorHandler;