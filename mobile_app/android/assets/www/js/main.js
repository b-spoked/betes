document.addEventListener("deviceready", startApplication, false);

window.BetesApp = window.BetesApp || {};

Backbone.View.prototype.close = function () {
    console.log('Closing view ' + this);
    if (this.beforeClose) {
        this.beforeClose();
    }
    this.remove();
    this.unbind();
};

var AppRouter = Backbone.Router.extend({

	routes: {
		"" : "showLogBook",
		"insights" : "showInsights",
		"settings" : "showSettings"
	},
	initialize : function() {
		this.getCurrentUser();
	},

	showLogBook: function() {
            app.showView( new LogbookView({model:window.BetesApp.User}) );
  	},
	
	showInsights: function() {
            app.showView( new InsightsView({model:window.BetesApp.User}));
  	},

	showSettings: function() {
        
		    app.showView( new SettingsView({model:window.BetesApp.User}));
  	},

    showView: function(view) {
        if (this.currentView)
            this.currentView.close();
        $('#app').html(view.render().el);
        this.currentView = view;
        return view;
    },
	getCurrentUser : function() {
		var user, users;
		
		window.BetesApp.Users = new UserDetails();
		
		window.BetesApp.Users.fetch({
			local : true
		});
		window.BetesApp.User = window.BetesApp.Users.first();
		
		if (!window.BetesApp.User) {
			window.BetesApp.Users.add(new User());
			window.BetesApp.User = window.BetesApp.Users.first();
		} else if ((window.BetesApp.User.get('id') > 0)
			&& (window.BetesApp.User.get('authenticated'))) {
			window.BetesApp.User.storage.sync.incremental();	
		}
	}
});

function startApplication() {
    app = new AppRouter();
    Backbone.history.start();
}