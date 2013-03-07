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
		"graphs" : "showGraphs",
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
	
	showGraphs: function() {
            app.showView( new GraphsView({model:window.BetesApp.User}));
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
		
		 var usr = window.BetesApp.Users.first();
		 
		 if(usr &&  usr.get('authenticated') && usr.get('id') > 0){
			window.BetesApp.User = usr;
			window.BetesApp.User.logEntries.storage.sync.incremental();	
		 }else{
			window.BetesApp.User = new User({name:"temp"});
			window.BetesApp.Users.add(window.BetesApp.User);
		 }
	}
});

function startApplication() {
    app = new AppRouter();
    Backbone.history.start();
}