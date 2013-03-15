/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:45 PM
 * To change this template use File | Settings | File Templates.
 */
windowHomeView = Backbone.View
		.extend({

			events : {
				'click #login' : 'showLoginDialog'
			},

			initialize : function() {
				_.bindAll(this);
				this.template = _.template($('#home-template').html());
			},
			render : function() {
				$(this.el).html(this.template(this.model.toJSON()));
				return this;
			},
			showLoginDialog : function(e) {
				var loginDialog = new LoginModal();
				loginDialog.render();
				var $modalEl = $("#modal-dialog");
				$modalEl.html(loginDialog.el);
				loginDialog.showDialog();
			}
		});