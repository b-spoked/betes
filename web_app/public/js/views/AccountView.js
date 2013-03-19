/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:45 PM
 * To change this template use File | Settings | File Templates.
 */
window.AccountView = Backbone.View
		.extend({

			events : {
				'click .save-account-settings' : 'saveAccountSettings'
			},

			initialize : function() {
				_.bindAll(this);
				this.template = _.template($('#account-template').html());
			},
			render : function() {
				$(this.el).html(this.template(this.model.toJSON()));
				return this;
			},
			saveAccountSettings : function(){
				$("#userNewsletter").val();
			}
		});