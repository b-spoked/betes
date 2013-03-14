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
		this.getCurrentUser();
	},

	showLogBook : function() {

		//this.loadEntries(function() {
			app.showView(new LogbookView({
				model : app.appUser
			}));
		//});

	},

	showInsights : function() {
		//this.loadEntries(function() {
			app.showView(new InsightsView({
				model : app.appUser
			}));
		//});
	},

	showGraphs : function() {
		//this.loadEntries(function() {
			app.showView(new GraphsView({
				model : app.appUser
			}));
		//});
	},

	showSettings : function() {
		//this.loadSettings(function() {
			app.showView(new SettingsView({
				model : app.appUser
			}));
		//});
	},

	showView : function(view) {
		if (this.currentView)
			this.currentView.close();
		$('#app').html(view.render().el);
		this.currentView = view;
		return view;
	},
	getCurrentUser : function() {
		var currentUser, users;

		users = new UserDetails();

		users.fetch({
			local : true
		});

		var currentUser = users.first();

		if (currentUser && currentUser.get('authenticated')
				&& currentUser.get('id') > 0) {
			this.appUser = currentUser;
			this.appUser.logEntries.fetch();
		} else {
			this.appUser = new User({
				name : "temp"
			});
			users.add(this.appUser);
		}
	},
	loadEntries : function(callback) {
		if (this.appUser.logEntries) {
			if (callback) callback();
		} else {
			this.appUser.logEntries.fetch({
				success : function() {
					if (callback) callback();
				}
			});
		}
	},
	loadSettings : function(callback) {
		if (this.appUser.logEntries) {
			if (callback) callback();
		} else {
			this.appUser.logEntries.fetch({
				success : function() {
					if (callback) callback();
				}
			});
		}
	}
});

function startApplication() {
	app = new AppRouter();
	Backbone.history.start();
}