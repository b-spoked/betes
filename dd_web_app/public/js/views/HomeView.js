/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:45 PM
 * To change this template use File | Settings | File Templates.
 */
Backbone.OAuth.configs = {
    Facebook: {
      auth_url: 'https://www.facebook.com/dialog/oauth',
      client_id :'226520900725004',
      redirect_url: 'http://insights-betes-log.herokuapp.com',
      scope: 'email' 
      
    },
    Google: {
      auth_url: 'https://accounts.google.com/o/oauth2/auth',
      client_id :'860380290684-cpmb7giqsq8dm0o08u30gg3pmit2u277.apps.googleusercontent.com',
      redirect_url: 'http://insights-betes-log.herokuapp.com',
      scope: 'https://www.googleapis.com/auth/userinfo.profile+https://www.googleapis.com/auth/userinfo.email'
    }
  };

window.HomeView = Backbone.View
		.extend({

			events : {
				'click #login-fb': 'loginWithFB',
		        'click #login-google': 'loginWithGoogle'
			},

			initialize : function() {
				_.bindAll(this);
				this.template = _.template($('#home-template').html());
			},
			render : function() {
				$(this.el).html(this.template());
				return this;
			},
			refreshAfterLogin:function(){
		    	Backbone.history.navigate('');
		    	window.location.reload();
		    },
		    authoriseAndSyncUser:function(loggedInUser){
		    	var users = new InsightsUserDetails();
		    	users.reset();
		    	users.create(loggedInUser);
		    	console.log("added user: "+JSON.stringify(loggedInUser))
		    },
		    loginWithFB: function() {
		    	
		    	var self = this;
		        _.extend(Backbone.OAuth.configs.Facebook, {

		            onSuccess: function(params) {
		               // console.log('FB ' + params.access_token);

		                // Get the user's data from Facebook's graph api.
		                $.ajax('https://graph.facebook.com/me?access_token=' + params.access_token, {
		                    success: function(data) {
		                    	
		                    	self.authoriseAndSyncUser({
		                    		thirdPartyId:data.id,
		                            name:data.name,
		                            email:data.email,
		                            thumbnailPath:data.picture,
		                            authenticated:true
		                        });
		                    }
		                });

		            }
		        });
		        // Create a new OAuth object and call the auth() method to start the process.
		        var FBAuthorisation = new Backbone.OAuth(Backbone.OAuth.configs.Facebook);
		        FBAuthorisation.auth();
		        //$("#login-dialog").modal('hide');
		    },
		    loginWithGoogle: function() {
		    	var self = this;
		    	//console.log('Logging in with google');

		        _.extend(Backbone.OAuth.configs.Google, {

		            onSuccess: function(params) {
		                //console.log('Google token: ' + params.access_token);

		                // Get the user's data from the Google api.
		                $.ajax('https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + params.access_token, {
		                    success: function(data) {
		                    	self.authoriseAndSyncUser({
		                    		thirdPartyId:data.id,
		                            name:data.name,
		                            email:data.email,
		                            thumbnailPath:data.picture,
		                            authenticated:true
		                        });
		                    	self.refreshAfterLogin();
		                    },
		                    error: function(xhr, settings, exception){
		                    	console.log("Token request error: " + xhr.responseText);
		                    }
		                });
		           
		            }
		        });
		        // Create a new OAuth object and call the auth() method to start the process.
		        var GoogleAuthorisation = new Backbone.OAuth(Backbone.OAuth.configs.Google);
		        GoogleAuthorisation.auth();
		        
		        //$("#login-dialog").modal('hide');
		    }
		});