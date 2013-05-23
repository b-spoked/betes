/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:45 PM
 * To change this template use File | Settings | File Templates.
 */
window.LoggedInHomeView = Backbone.View
		.extend({

			initialize : function() {
				_.bindAll(this);
				this.template = _.template($('#loggedin-home-template').html());
			},
			render : function() {
				$(this.el).html(this.template(this.model.toJSON()));
				return this;
			}
		});