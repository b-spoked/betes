/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:45 PM
 * To change this template use File | Settings | File Templates.
 */
window.LowMateSettingsView = Backbone.View
		.extend({

			events : {
				'click .save-settings' : 'saveSettings'
			},

			initialize : function() {
				_.bindAll(this);
				this.template = _.template($('#settings-template').html());
			},
			render : function() {
				$(this.el).html(this.template(this.model.toJSON()));
				_.defer( function( view ){ view.closeHelp();}, this );
				return this;
			},
			closeHelp : function() {
				if(this.model.settings.length>0){
					$("#settings-getting-started").hide();
				}
			},
			saveSettings : function(){
				this.model.settings.create(this.getAddedSettings());
			},
			getAddedSettings : function(){
				return {
					name : $("#contactName").val().trim(),
					email : $("#contactEmail").val().trim(),
					mobile : $("#contactMobile").val().trim(),
					userId : this.model.get('sid')
				};
			}
		});