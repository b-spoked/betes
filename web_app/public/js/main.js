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
		"insights" : "showInsights",
		"graphs" : "showGraphs",
		"settings" : "showSettings"
	},

	initialize : function() {
		this.getAuthenticatedUser();
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

	showInsights : function() {
		if (app.appUser) {
			app.showView(new InsightsView({
				model : app.appUser
			}));
		} else {
			this.showHomeView();
		}
	},

	showHomeView : function() {
		app.showView(new HomeView());
	},

	showGraphs : function() {
		if (app.appUser) {
			app.showView(new GraphsView({
				model : app.appUser
			}));
		} else {
			this.showHomeView();
		}
	},

	showSettings : function() {
		if (app.appUser) {
			app.showView(new SettingsView({
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

		users = new UserDetails();

		users.fetch({
			local : true
		});

		currentUser = users.first();
        currentUser.fetch();

		if (currentUser && currentUser.get('authenticated')
				&& currentUser.get('sid') > 0) {
			this.appUser = currentUser;
			this.appUser.logEntries.fetch();
		}
	}
});

function startApplication() {
	app = new AppRouter();
	Backbone.history.start();
}