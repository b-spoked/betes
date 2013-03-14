/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:45 PM
 * To change this template use File | Settings | File Templates.
 */
window.SettingsView = Backbone.View
		.extend({

			events : {
				'click .create-new-settings' : 'showNewSettingsDialog'
			},

			initialize : function() {
				_.bindAll(this);
				this.template = _.template($('#settings-template').html());
			},
			render : function() {
				$(this.el).html(this.template(this.model.toJSON()));
				return this;
			},
			showNewSettingsDialog : function(){
				alert('new settings');
			}
		});