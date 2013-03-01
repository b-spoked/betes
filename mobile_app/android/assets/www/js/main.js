window.BetesApp = window.BetesApp || {};

var ApplicationRouter = Backbone.Router.extend({

	navigationView : null,

	routes : {
		"" : "showLogBook",
		"account" : "showAccount"
	},

	initialize : function() {
		console.log('load nav');
		this.navigationView = new NavigationView();
	},

	showLogBook : function() {
		console.log('load logbook');
		this.setActiveNav("#log-page");
		RegionManager.show(new LogBookView());
	},
	showAccount : function() {
		this.setActiveNav("#settings-page");
		RegionManager.show(new AccountView({
			model : app.User
		}));
	},
	setActiveNav : function(activeId) {
		$(activeId).parent().parent().find('.active').removeClass('active');
		$(activeId).addClass('active');
	}
});

RegionManager = (function(Backbone, $) {
	var currentView;
	var el = "#main";
	var region = {};

	var closeView = function(view) {
		if (view && view.close) {
			view.close();
		}
	};
	var openView = function(view) {
		view.render();
		$(el).html(view.el);
		if (view.onShow) {
			view.onShow();
		}
	};
	region.show = function(view) {
		closeView(currentView);
		currentView = view;
		openView(currentView);
	};
	return region;
})(Backbone, jQuery);

function startApp() {
	
	console.log('lets start!!');
	
	app = new ApplicationRouter();
	Backbone.history.start();
}