/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:55 PM
 * To change this template use File | Settings | File Templates.
 */
window.NavigationView = Backbone.View.extend({

	el : "#app-nav",

	events : {
		'click #login' : 'showLoginDialog'
	},

	navigationTemplate : _.template($('#nav-template').html()),

	initialize : function() {
		this.getCurrentUser();
		_.bindAll(this, "render");
		window.BetesApp.User.bind('change:authenticated', this.render, this);
		this.render();
	},
	render : function() {
		$(this.el).html(this.navigationTemplate(window.BetesApp.User.toJSON()));
		return this;
	},

	showLoginDialog : function(e) {
		var loginDialog = new LoginView();
		loginDialog.render();
		var $modalEl = $("#modal-dialog");
		$modalEl.html(loginDialog.el);
		loginDialog.showDialog();
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
			window.BetesApp.Users.storage.sync.push();

		}

	}

});