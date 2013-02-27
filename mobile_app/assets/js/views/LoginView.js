/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:53 PM
 * To change this template use File | Settings | File Templates.
 */
window.LoginView = Backbone.View.extend({

    loginTemplate: _.template($('#login-template').html()),

    events: {
        'click #login-fb': 'loginWithFB',
        'click #login-google': 'loginWithGoogle'
    },

    initialize: function() {
        _.bindAll(this);
        app.User.on('change:authenticated', this.setUserSaveStatus, this);
    },
    render: function() {
        $(this.el).html(this.loginTemplate());
    },
    showDialog:function() {
        $("#login-dialog").modal('show');
    },
    setUserSaveStatus:function() {
        if (app.User.get('authenticated')) {
            this.setServerSave();
            return;
        }
        this.setLocalSave();
    },
    loginWithFB: function() {
        _.extend(Backbone.OAuth.configs.Facebook, {

            onSuccess: function(params) {
                console.log('FB ' + params.access_token);

                // Get the user's data from Facebook's graph api.
                $.ajax('https://graph.facebook.com/me?access_token=' + params.access_token, {
                    success: function(data) {
                        app.Users = new UserDetails();
                        app.Users.fetch({local:true});

                        app.User = app.Users.first();

                        if (!app.User || (app.User.get("id") != data.id)) {
                            console.log('3rd party id: ' + data.id);
                            app.User = new User({
                                id:data.id,
                                name:data.name,
                                email:data.email,
                                thumbnailPath:data.picture,
                                authenticated:true
                            });

                            app.User.fetch();
                            app.User.save();

                            app.Users.reset();
                            app.Users.create(app.User, {local:true});

                        }
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
        _.extend(Backbone.OAuth.configs.Google, {

            onSuccess: function(params) {
                console.log('Google: ' + params.access_token);

                // Get the user's data from the Google api.
                $.ajax('https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + params.access_token, {
                    success: function(data) {
                        app.Users = new UserDetails();
                        app.Users.fetch({local:true});

                        app.User = app.Users.first();

                        if (!app.User || (app.User.get("id") != data.id)) {
                            console.log('3rd party id: ' + data.id);
                            app.User = new User({
                                id:data.id,
                                name:data.name,
                                email:data.email,
                                thumbnailPath:data.picture,
                                authenticated:true
                            });

                            app.User.fetch();
                            app.User.save();

                            app.Users.reset();
                            app.Users.create(app.User, {local:true});

                        }

                    }
                });
            }
        });
        // Create a new OAuth object and call the auth() method to start the process.
        var GoogleAuthorisation = new Backbone.OAuth(Backbone.OAuth.configs.Google);
        GoogleAuthorisation.auth();
        $("#login-dialog").modal('hide');
    },

    setLocalSave:function() {
        console.log('save local only');
        Offline.onLine = function() {
            return false;
        };
    },

    setServerSave:function() {

        console.log('save to server if online');
        Offline.onLine = function() {
            return navigator.onLine !== false;
        };
    }
});