Backbone.OAuth.configs = {
    Facebook: {
      auth_url: 'https://www.facebook.com/dialog/oauth',
      client_id :'226520900725004',
      redirect_url: 'http://insights-betes-log.herokuapp.com',
      scope: 'email' 
      
    },
    Google: {
      auth_url: 'https://accounts.google.com/o/oauth2/auth',
      client_id :'860380290684-cpmb7giqsq8dm0o08u30gg3pmit2u277.apps.googleusercontent.com',
      redirect_url: 'http://insights-betes-log.herokuapp.com',
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
		"" : "showLogBook",
		"share/:linkId" : "shareLogBook",
		"graphs" : "showDashboard",
		"account" : "showAccount"
	},

	initialize : function() {
		this.getAuthenticatedUser();
		if (!this.appUser) {
			this.appUser = new InsightsUser();
		}
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
			app.showView(new InsightsLogbookView({
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
					app.showView(new InsightsLogbookView({
						model : app.appUser
					}));
		        }});
			}
		});

	},
	showHomeView : function() {
		app.showView(new HomeView());
	},
	showDashboard : function() {
		if (app.appUser) {
			app.showView(new InsightsDashboardView({
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

		if (currentUser && currentUser.get('authenticated')
				&& currentUser.get('sid') > 0) {
			this.showLoadingDialog();
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