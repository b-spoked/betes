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
				'click .save-settings' : 'saveSettings',
				'click .save-account-settings' : 'saveAccountSettings'
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
				this.model.settings.create(this.getCurrentSettings());
			},
			saveAccountSettings : function(){
				$("#userNewsletter").val();
			},
			getCurrentSettings : function(){
				return {
					lowReading : $("#lowReading").val().trim(),
					highReading : $("#highReading").val().trim(),
					readingFreq : $("#readingFreq").val().trim(),
					excerciseTime: $("#excerciseTime").val().trim(),
					excerciseFreq: $("#excerciseFreq").val().trim(),
					current : true,
					userId : this.model.get('sid')
				};
			}
		});