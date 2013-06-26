
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
		"" : "showLogBook",
		"share/:linkId" : "shareLogBook",
		"graphs" : "showDashboard",
		"quick" : "showQuickInsights",
		"account" : "showAccount",
		"access_token/:authCode":"logonUser"
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
	logonUser: function(userLogonCode){
		//access_token=ya29.AHES6ZS_mFZPygrcmM0hhmhLDbwAiBLwW0-RKNbX1W2Z-rOjviVhOJo&token_type=Bearer&expires_in=3600
		alert(userLogonCode);
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