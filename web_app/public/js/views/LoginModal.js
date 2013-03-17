/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:53 PM
 * To change this template use File | Settings | File Templates.
 */
window.LoginModal = Backbone.View.extend({

    events: {
        'click #login-fb': 'loginWithFB',
        'click #login-google': 'loginWithGoogle'
    },

    initialize: function() {
		_.bindAll(this);
    	this.template = _.template($('#login-template').html());
    },
    render: function() {
    	 $(this.el).html(this.template());
    	 return this;
    },
    showDialog:function() {
        $("#login-dialog").modal('show');
    },
    authoriseAndSyncUser:function(loggedInUser){
    	var users = new UserDetails();
    	users.reset();
    	app.appUser = loggedInUser;
    	app.appUser.save();
    	users.create(app.appUser,{local:true});
        app.navigate("#/settings");
    },
    loginWithFB: function() {
    	
    	var self = this;
        _.extend(Backbone.OAuth.configs.Facebook, {

            onSuccess: function(params) {
                console.log('FB ' + params.access_token);

                // Get the user's data from Facebook's graph api.
                $.ajax('https://graph.facebook.com/me?access_token=' + params.access_token, {
                    success: function(data) {
                    	
                    	self.authoriseAndSyncUser(new User({
                    		thirdPartyId:data.id,
                            name:data.name,
                            email:data.email,
                            thumbnailPath:data.picture,
                            authenticated:true
                        }));
                    }
                });

            }
        });
        // Create a new OAuth object and call the auth() method to start the process.
        var FBAuthorisation = new Backbone.OAuth(Backbone.OAuth.configs.Facebook);
        FBAuthorisation.auth();
        $("#login-dialog").modal('hide');
    },
    loginWithGoogle: function() {
    	var self = this;
        _.extend(Backbone.OAuth.configs.Google, {

            onSuccess: function(params) {
                console.log('Google: ' + params.access_token);

                // Get the user's data from the Google api.
                $.ajax('https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + params.access_token, {
                    success: function(data) {
                    	self.authoriseAndSyncUser(new User({
                    		thirdPartyId:data.id,
                            name:data.name,
                            email:data.email,
                            thumbnailPath:data.picture,
                            authenticated:true
                        }));
                    }
                });
            }
        });
        // Create a new OAuth object and call the auth() method to start the process.
        var GoogleAuthorisation = new Backbone.OAuth(Backbone.OAuth.configs.Google);
        GoogleAuthorisation.auth();
        $("#login-dialog").modal('hide');
    }
});