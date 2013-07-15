Backbone.OAuth.configs = {
    
    Google: {
      auth_url: 'https://accounts.google.com/o/oauth2/auth',
      token_url: 'https://accounts.google.com/o/oauth2/token',
      client_secret:'KIUxT6jSbQkFuPE7vnxywVB_',
      client_id :'860380290684-05mbl7vgps042pq703ipb0vdu0rn9alq.apps.googleusercontent.com',
      redirect_url: 'http://localhost',
      scope: 'https://www.googleapis.com/auth/userinfo.profile+https://www.googleapis.com/auth/userinfo.email'
    }
  };

document.addEventListener("online", syncData, false);

Backbone.View.prototype.close = function() {
	//console.log('Closing view ' + this);
	if (this.beforeClose) {
		this.beforeClose();
	}
	this.remove();
	this.unbind();
};

var AppRouter = Backbone.Router.extend({

	routes : {
		"": "showHome",
		"log" : "showLogBook",
		"insights" : "showGlucoseInsights",
		"account" : "showAccount",
		"add" : "addEvent",
		"hypo" : "showHypo",
		"counts" : "showEvents",
		"help" : "showHelp"
	},

	initialize : function() {
		this.getAuthenticatedUser();
		$("#toucharea").hammer().on("doubletap", function(event) {
			Backbone.history.navigate('');
	    	window.location.reload();
	    });
	},
	showLoadingDialog : function() {
		var loadingDialog = new LoadingModal();
		loadingDialog.render();
		var $modalEl = $("#modal-dialog");
		$modalEl.html(loadingDialog.el);
		loadingDialog.showDialog();
	},
	showLogBook : function() {
		if (app.appUser) {
			app.showView(new DailyLogView({
				model : app.appUser
			}));
		} else {
			this.showHomeView();
		}
	},
	showEvents : function() {
		if (app.appUser) {
			app.showView(new TimelineView({
				model : app.appUser
			}));
		} else {
			this.showHomeView();
		}
	},
	showHome : function() {
		if (app.appUser) {
			app.showView(new LoggedInHomeView({
				model : app.appUser
			}));
		} else {
			this.showHomeView();
		}
	},
	addEvent : function() {
		if (app.appUser) {
			app.showView(new AddEntryView({
				model : app.appUser
			}));
		} else {
			this.showHomeView();
		}
	},
	showHypo : function() {
		if (app.appUser) {
			app.showView(new HypoView({
				model : app.appUser
			}));
		} else {
			this.showHomeView();
		}
	},
	showHelp : function() {
		if (app.appUser) {
			app.showView(new HelpView({
				model : app.appUser
			}));
		} else {
			this.showHomeView();
		}
	},
	shareLogBook : function(usersLinkId) {
		
		app.appUser = new InsightsUser();
		var self = this;

		app.appUser.fetch({
			data : {
				linkId : usersLinkId
			},
			processData : true,
			success : function(results) {
				self.showLoadingDialog();
				app.appUser.logEntries.fetch({success: function(){
					
					app.showView(new LogbookView({
						model : app.appUser
					}));
		        }});
			}
		});

	},
	showHomeView : function() {
		app.showView(new HomeView());
	},
	showGlucoseInsights : function() {
		if (app.appUser) {
			app.showView(new GlucoseInsightsView({
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
		//console.log('current user: '+JSON.stringify(currentUser));
		if (currentUser && currentUser.get('authenticated')) {
//TODO			//this.showLoadingDialog();
			this.appUser = currentUser;
			this.appUser.logEntries.fetch();
		}
	}
});

function startApplication() {
	app = new AppRouter();
	Backbone.history.start();
}

function syncData(){

	console.log('try to sync data');
	if(app){
		console.log('syncing data');
		//users = new InsightsUserDetails();
		//users.storage.sync.push();
		
		//app.appUser.fetch();
		/*var users = new InsightsUserDetails();
    	users.reset();
    	users.create(app.appUser);
    	users.storage.sync.push();
		//app.appUser.save();
		//console.log(JSON.stringify(app.appUser));
		app.appUser.logEntries.storage.sync.push();*/
		
		/*app.appUser.fetch({
			success : function(results) {
				console.log('user done: '+JSON.stringify(results));
				
			}
		});*/
		
		app.appUser.logEntries.storage.sync.push();
		
	}
}