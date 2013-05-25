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
		"": "showHome",
		"log" : "showLogBook",
		"insights" : "showQuickInsights",
		"account" : "showAccount",
		"add" : "addEvent",
		"hypo" : "showHypo",
		"help" : "showHelp"
	},

	initialize : function() {
		this.getAuthenticatedUser();
		
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
			app.showView(new LogbookView({
				model : app.appUser
			}));
		} else {
			this.showHomeView();
		}
	},
	showHome : function() {
		//app.appUser = new InsightsUser();
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
	showQuickInsights : function() {
		if (app.appUser) {
			app.showView(new QuickInsightsView({
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
		console.log('current user: '+JSON.stringify(currentUser));
		if (currentUser && currentUser.get('authenticated')
				) {
//TODO			//this.showLoadingDialog();
			this.appUser = currentUser;
			this.appUser.logEntries.fetch({
				data : { all : false },
				processData : true
				});
		}
	}
});

function startApplication() {
	app = new AppRouter();
	Backbone.history.start();
}