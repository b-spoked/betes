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
		
		 this.before(function() {
			 app.showView( new LogbookView({model:app.appUser}) );
	     });
		
  	},
	
	showInsights: function() {
            app.showView( new InsightsView({model:window.BetesApp.User}));
  	},
	
	showGraphs: function() {
		this.before(function() {
			app.showView( new LogbookView({model:window.BetesApp.User}) );
	    });
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
		var currentUser, users;
		
		users = new UserDetails();
		
		users.fetch({
			local : true
		});
		
		 var currentUser = users.first();
		 
		 if(currentUser &&  currentUser.get('authenticated') && currentUser.get('id') > 0){
			 this.appUser = currentUser;
			//window.BetesApp.User.logEntries.storage.sync.incremental();	
		 }else{
			 this.appUser = new User({name:"temp"});
			 users.add(this.appUser);
		 }
	},
	before: function(callback) {
        if (this.appUser.logEntries && this.appUser.logEntries.length > 0) {
            callback();
        } else {
        	this.appUser.logEntries.storage.sync.full({success: function() {
               callback();
            }});
        }
    }
});

function startApplication() {
    app = new AppRouter();
    Backbone.history.start();
}