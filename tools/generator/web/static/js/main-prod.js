'use strict';

require.config({
	baseUrl: window.top.__baseStaticPath__ + '/js',

	paths: {
		jquery: 'vendor/jquery-3.1.0.min',
		bootstrap: 'vendor/bootstrap-3.3.2.min'
	},

	shim: {
		bootstrap: {
			deps: ['jquery']
		}
	},

	callback: function() {
		require([
			'views/view.min',
			'bootstrap'
		], function(view) {
			if (document.createEvent) {
				var event = document.createEvent('HTMLEvents');
				event.initEvent('JQueryReady', true, true);
				window.dispatchEvent(event);
			} else {
				window.fireEvent('onJQueryReady', document.createEventObject());
			}
			view.initialize();
		});
	}
});