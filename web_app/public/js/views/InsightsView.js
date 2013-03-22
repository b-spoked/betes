/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:45 PM
 * To change this template use File | Settings | File Templates.
 */
window.InsightsView = Backbone.View
		.extend({

			events : {
				'keyup #filter-insight-days' : 'filterDaysShown'
			},

			initialize : function() {
				_.bindAll(this);
				this.template = _.template($('#insights-template').html());
			},
			render : function() {
				$(this.el).html(this.template({name:this.model.get('name'),authenticated:this.model.get('authenticated'),lows:this.model.lows(),highs:this.model.highs(),tests:this.model.tests(),exercise:this.model.exercise()}));
				return this;
			},
			filterDaysShown : function() {
				var days = $(".insight-days").val();
				this.model.logEntries.filterDays(days);
			}
		});