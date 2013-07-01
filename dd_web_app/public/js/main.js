Backbone.OAuth.configs = {

	Facebook : {
		auth_url : 'https://www.facebook.com/dialog/oauth',
		client_id : '226520900725004',
		redirect_url : 'http://insights-betes-log.herokuapp.com',
		scope : 'email'

	},

	Google : {
		auth_url : 'https://accounts.google.com/o/oauth2/auth',
		client_id : '860380290684-hckpgntj03rabg58g5ubcc1l7sf90mok.apps.googleusercontent.com',
		redirect_url : 'http://betes-insights.herokuapp.com',
		scope : 'https://www.googleapis.com/auth/userinfo.profile+https://www.googleapis.com/auth/userinfo.email'
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
		"" : "showHome",
		"summary" : "showGlucoseInsights",
		"account" : "showAccount",
		"add" : "addEvent",
		"hypo" : "showHypo",
		"timeline" : "showTimeline",
		"upload" : "uploadResults",
		"access_token/:authCode":"logonUser"
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
	logonUser: function(userLogonCode){
		//access_token=ya29.AHES6ZS_mFZPygrcmM0hhmhLDbwAiBLwW0-RKNbX1W2Z-rOjviVhOJo&token_type=Bearer&expires_in=3600
		alert(userLogonCode);
	},
	showTimeline : function() {
		if (app.appUser) {
			app.showView(new TimelineView({
				model : app.appUser
			}));
		} else {
			this.showHomeView();
		}
	},
	uploadResults : function() {
		alert('TODO');
		/*if (app.appUser) {
			app.showView(new UploadView({
				model : app.appUser
			}));
		} else {
			this.showHomeView();
		}*/
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
				app.appUser.logEntries.fetch({
					success : function() {

						app.showView(new LogbookView({
							model : app.appUser
						}));
					}
				});
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
		console.log('current user: ' + JSON.stringify(currentUser));
		if (currentUser && currentUser.get('authenticated')) {
			//TODO			this.showLoadingDialog();
			this.appUser = currentUser;
			if(this.appUser.get('sid') && this.appUser.get('sid')!='new'){
				this.appUser.logEntries.fetch({
					data : {
						all : false
					},
					processData : true
				});
			}
		}
	}
});

function startApplication() {
	app = new AppRouter();
	Backbone.history.start();
}