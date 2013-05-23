/* 
 * backbone.oauth.js v0.1
 * Copyright (C) 2012 Philipp Nolte
 * backbone.oauth.js may be freely distributed under the MIT license.
 */

(function(window) {
	"use strict";

	// Alias backbone, underscore and jQuery.
	var Backbone = window.Backbone, _ = window._, $ = window.$;

	// Parse hash helper method used for parsing location.hash.
	var parseHashParam = function(name, url) {
		//console.log("Given url: " + url);

		var params = {}, regex = /([^&=]+)=([^&]*)/g, m;
		while (m = regex.exec(url)) {
			console.log('param name: ' + m[1]);
			console.log('param value: ' + m[2]);
			params[name] = decodeURIComponent(m[2]);
		}
		return params;
	}

	// ============================================================================

	// Extend Backbone with OAuth functionality.
	Backbone.OAuth || (Backbone.OAuth = {});

	// The base OAuth class.
	Backbone.OAuth = function(options) {

		// Override any default option with the options passed to the
		// constructor.
		_.extend(this, options);
		_.bindAll(this);

	};

	// Inject methods and properties.
	_.extend(Backbone.OAuth.prototype, {

		// Default for most applications.
		access_token_name : 'access_token',

		window_reference : {},

		// Configures the auth dialog url.
		setupAuthUrl : function() {
			var url = this.auth_url + '?client_id=' + this.client_id
					+ '&redirect_uri=' + this.redirect_url
					+ '&response_type=code' + '&access_type=offline';
			if (this.scope)
				url += '&scope=' + this.scope;
			if (this.state)
				url += '&state=' + this.state;

			return url;
		},

		// Open the OAuth dialog and wait for a redirect.
		auth : function() {
			if (!this.access_token_name)
				throw new Error('No access token name given.');
			if (!this.auth_url)
				throw new Error('No auth url given.');
			if (!this.redirect_url)
				throw new Error('No redirect url given.');

			this.window_reference = window.open(this.setupAuthUrl(), '_blank',
					'location=no');
			this.window_reference.addEventListener('loadstop',
					this.getCodeForToken);
		},
		getCodeForToken : function(data) {
			if (data.url.indexOf("code=") != -1) {
				var params = parseHashParam("code", data.url);
				if (params["code"]) {
					console.log('Code is: ' + params["code"]);
					this.getAccessToken(params["code"])
				}
				this.window_reference.close();
			}
		},
		getAccessToken : function(givenCode) {

			var self = this;

			$.ajax({
				type : "POST",
				url : this.token_url,
				data : {
					code : givenCode,
					client_id : this.client_id,
					client_secret : this.client_secret,
					redirect_uri : this.redirect_url,
					grant_type : 'authorization_code'
				}
			}).done(function(data) {
				//console.log("Token Received");
				self.onRedirect(data);

			}).fail(function(xhr, textStatus) {
				console.log("Token request error: " + xhr.responseText);

			}).always(function() { // console.log("Token request
				// complete");
			});
		},

		// Called on redirection inside the OAuth dialog window. This indicates,
		// that the dialog auth process has finished. It has to be checked, if
		// the auth was successful or not.
		onRedirect : function(data) {
			
			//console.log('Access token: ' + data.access_token);

			var params = {};
			params[this.access_token_name] = data.access_token;
			//console.log('params for: ' + params[this.access_token_name]);
			
			if (this.authSuccess(params)) {
				this.onSuccess(params);
			} else {
				this.onError(params);
			}
		},

		// Detect if we have a successful auth.
		authSuccess : function(params) {
			return params[this.access_token_name];
		},

		// These following methods have to be implemented by the OAuth
		// application.
		onError : function(params) {
		},

		onSuccess : function(params) {
		}

	});

})(this);