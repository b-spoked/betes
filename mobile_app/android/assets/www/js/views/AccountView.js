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
				'click .save-account-settings' : 'saveAccountSettings',
				'click #logout' : 'logout'
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
				this.model.set(this.getUserValues());
				this.model.set("shareLinkId",this.createSharingKey());
				this.model.save();
			},
			logout : function (){
				console.log('Logging out ...');
				window.localStorage.clear();
				this.refreshApp();
			},
		    refreshApp:function(){
		    	Backbone.history.navigate('');
		    	window.location.reload();
		    },
			getUserValues : function (){
				return{
					newsletter : $("#userNewsletter").val(),
					testingUnits : $("#userTestingUnits").val(),
					allowSharing : $("#allowSharing").val()
				};
			},
			createSharingKey : function(){
				var key = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
				    return v.toString(16);
				});
				return key;
			}
		});