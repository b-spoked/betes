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
		"settings" : "showSettings",
		"account" : "showAccount"
	},
	initialize : function() {
		this.getAuthenticatedUser();
	},
	showLogBook : function() {
		if (app.appUser) {
			app.showView(new LowMateLogbookView({
				model : app.appUser
			}));
		} else {
			this.showHomeView();
		}
	},
	showHomeView : function() {
		app.showView(new HomeView());
	},
	showSettings : function() {
		if (app.appUser) {
			app.showView(new LowMateSettingsView({
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

		if(!currentUser){
			this.addTestUser();
			users.fetch({
				local : true
			});
			currentUser = users.first();
		}
		this.appUser = currentUser;
		
		/*if (currentUser && currentUser.get('authenticated')
				&& currentUser.get('sid') > 0) {
			this.appUser = currentUser;
			this.appUser.logEntries.fetch();
		}*/ 
	},
	addTestUser:function(){
		var users = new UserDetails();
    	users.reset();
    	//app.appUser = loggedInUser;
    	//app.appUser.save();
    	users.create({
    		thirdPartyId:'123456789',
            name:'Test User',
            email:'testing@username.com',
            thumbnailPath:'',
            authenticated:true
        });
	}
	
});

function startApplication() {
	app = new AppRouter();
	Backbone.history.start();
}