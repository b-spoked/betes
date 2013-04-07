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

Backbone.View.prototype.close = function() {
	console.log('Closing view ' + this);
	if (this.beforeClose) {
		this.beforeClose();
	}
	this.remove();
	this.unbind();
};

var AppRouter = Backbone.Router.extend({

	routes : {
		"" : "showLogBook",
		"share/:linkId" : "shareLogBook",
		"graphs" : "showGraphs",
		"account" : "showAccount"
	},

	initialize : function() {
		this.getAuthenticatedUser();
		if (!this.appUser) {
			this.appUser = new InsightsUser();
		}
	},

	showLogBook : function() {
		if (app.appUser) {
			app.showView(new InsightsLogbookView({
				model : app.appUser
			}));
		} else {
			this.showHomeView();
		}
	},
	shareLogBook : function(usersLinkId) {
		
		app.appUser = new InsightsUser();

		app.appUser.fetch({
			data : {
				linkId : usersLinkId
			},
			processData : true,
			success : function(results) {
				
				app.appUser.logEntries.fetch({success: function(){
					app.showView(new InsightsLogbookView({
						model : app.appUser
					}));
		        }});
			}
		});

	},

	showHomeView : function() {
		app.showView(new HomeView());
	},

	showGraphs : function() {
		if (app.appUser) {
			app.showView(new InsightsGraphsView({
				model : app.appUser
			}));
		} else {
			this.showHomeView();
		}
	},
	showAccount : function() {
		if (app.appUser) {
			app.showView(new AccountView({
				model : app.appUser
			}));
		} else {
			this.showHomeView();
		}
	},

	showView : function(view) {
		if (this.currentView)
			this.currentView.close();
		$('#app').html(view.render().el);
		this.currentView = view;
		return view;
	},
	getAuthenticatedUser : function() {
		var currentUser, users;

		users = new InsightsUserDetails();
//TODO ?? why this way
		currentUser = new InsightsUser(users.storage.findAll()[0]);

		if (currentUser && currentUser.get('authenticated')
				&& currentUser.get('sid') > 0) {
			this.appUser = currentUser;
			this.appUser.logEntries.fetch();
		}
	},
	getSharingUser : function(userLinkId) {

		var sharingUser = new InsightsUser();
		var self = this;

		sharingUser.fetch({
			data : {
				linkId : userLinkId
			},
			processData : true,
			success : function(results) {
				this.appUser = new User(results);
				this.appUser.logEntries.fetch();
			}
		});
	}
});

function startApplication() {
	app = new AppRouter();
	Backbone.history.start();
}