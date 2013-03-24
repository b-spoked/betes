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
		"insights" : "showInsights",
		"graphs" : "showGraphs",
		"settings" : "showSettings",
		"account" : "showAccount"
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
	shareLogBook : function(linkId) {
		
		alert('id: '+linkId);
		//this.getSharingUser(linkId);
		app.showView(new ShareView({
			model : app.appUser
		}));
		 
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

		users = new UserDetails();

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
	getSharingUser : function(linkId) {
		
		//var sharingUser = new User({shareLinkId:linkId});
		//sharingUser.fetch();
		//this.appUser = sharingUser;
		//this.appUser.logEntries.fetch();
	}
});

function startApplication() {
	app = new AppRouter();
	Backbone.history.start();
}