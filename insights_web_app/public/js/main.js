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
			app.showView(new LogbookView({
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
					app.showView(new ShareView({
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

		users.fetch({
			local : true
		});

		currentUser = users.first();

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